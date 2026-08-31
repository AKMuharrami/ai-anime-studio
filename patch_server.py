import re

with open('server.ts', 'r') as f:
    code = f.read()

# Add imports
imports = """import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import authRoutes from './src/routes/auth.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { db, checkDbReady } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';
"""
code = re.sub(r'import express from "express";\nimport path from "path";\nimport \{ createServer as createViteServer \} from "vite";', imports, code)

# Register auth router
router_reg = """const app = express();
app.use(express.json());

// Auth Routes
app.use('/api/auth', authRoutes);

// Real Profile Route
app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    checkDbReady();
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const userResult = await db.select().from(users).where(eq(users.id, req.user.id));
    if (userResult.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = userResult[0];
    res.json({
      id: user.id,
      email: user.email,
      wallet_balance: user.wallet_balance,
      is_verified: user.is_verified,
      created_at: user.created_at
    });
  } catch (error: any) {
    if (error.message.includes('DATABASE_URL')) {
      // Return mock data for UI demo purposes if no DB
      res.json({ id: req.user?.id || 'mock', email: req.user?.email || 'mock@example.com', wallet_balance: 1420.50, is_verified: true });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
"""
code = code.replace("const app = express();\napp.use(express.json());", router_reg)

# Update wallet topup
wallet_search = r'app\.post\("/api/wallet/topup", \(req, res\) => \{[\s\S]*?res\.json\(\{\n      success: true,[\s\S]*?\}\);\n  \} catch \(error: any\) \{'
wallet_replace = """app.post("/api/wallet/topup", requireAuth, async (req: AuthRequest, res) => {
  try {
    checkDbReady();
    const { amount } = req.body;
    const topupAmount = parseFloat(amount) || 100.00;
    
    if (topupAmount <= 0) {
      return res.status(400).json({ error: "Top-up amount must be strictly greater than $0.00" });
    }
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userResult = await db.select().from(users).where(eq(users.id, req.user.id));
    if (userResult.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const newBalance = userResult[0].wallet_balance + topupAmount;
    
    await db.update(users).set({ wallet_balance: newBalance }).where(eq(users.id, req.user.id));

    res.json({
      success: true,
      message: `Successfully credited $${topupAmount.toFixed(2)} to prepaid wallet.`,
      new_balance: newBalance,
      shariah_protection_status: "ACTIVE (No debt / negative balance permitted)"
    });
  } catch (error: any) {
    if (error.message.includes('DATABASE_URL')) {
      // Mock for UI
      const { amount } = req.body;
      const topupAmount = parseFloat(amount) || 100.00;
      return res.json({
        success: true,
        message: `[MOCK] Successfully credited $${topupAmount.toFixed(2)}. Configure Neon DB for real updates.`,
        new_balance: 1420.50 + topupAmount,
        shariah_protection_status: "ACTIVE (No debt / negative balance permitted)"
      });
    }"""
code = re.sub(wallet_search, wallet_replace, code)

with open('server.ts', 'w') as f:
    f.write(code)

print("server.ts patched.")
