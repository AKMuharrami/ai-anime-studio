import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { users, otp_verifications } from '../db/schema.ts';
import { sendOTP } from '../utils/mailer.ts';

import { requireAuth, AuthRequest } from '../middleware/auth.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db.insert(users).values({
      email,
      password_hash: passwordHash,
      is_verified: false,
      wallet_balance: 50.0 // Starting balance limited to 50 tokens
    }).returning();

    const user = newUser[0];

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(otp_verifications).values({
      user_id: user.id,
      otp_code: otpCode,
      expires_at: expiresAt
    });

    // Send Email
    let emailSent = true;
    try {
      await sendOTP(email, otpCode);
    } catch (mailErr: any) {
      console.error('Mail delivery failed but user registration was recorded:', mailErr);
      emailSent = false;
    }
 
    res.json({ 
      success: true, 
      message: emailSent ? 'OTP sent to email' : 'Account created. Email delivery pending or simulated.', 
      userId: user.id,
      otpCode: emailSent ? undefined : otpCode
    });
  } catch (err: any) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult[0];

    if (user.is_verified) {
      return res.json({ success: true, message: 'Already verified' });
    }

    const otpRecords = await db.select()
      .from(otp_verifications)
      .where(
        and(
          eq(otp_verifications.user_id, user.id),
          eq(otp_verifications.otp_code, otp),
          gt(otp_verifications.expires_at, new Date())
        )
      );

    if (otpRecords.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await db.update(users)
      .set({ is_verified: true })
      .where(eq(users.id, user.id));

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err: any) {
    console.error('Verify Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = userResult[0];

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified. Please verify OTP.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, is_verified: user.is_verified }, JWT_SECRET, {
      expiresIn: '7d'
    });

    const isAdmin = user.email.toLowerCase() === 'akmuharrami@gmail.com' || user.email.toLowerCase().startsWith('admin');

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        wallet_balance: user.wallet_balance,
        is_admin: isAdmin
      }
    });
  } catch (err: any) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Logged-in User Profile
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userResult = await db.select().from(users).where(eq(users.id, req.user.id));
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult[0];
    const isAdmin = user.email.toLowerCase() === 'akmuharrami@gmail.com' || user.email.toLowerCase().startsWith('admin');

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        wallet_balance: user.wallet_balance,
        is_admin: isAdmin
      }
    });
  } catch (err: any) {
    console.error('Me Fetch Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
