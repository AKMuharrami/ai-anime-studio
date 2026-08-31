import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    is_verified: boolean;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    
    // Check verification if needed (can be a separate middleware)
    if (!req.user?.is_verified) {
      return res.status(403).json({ error: 'Forbidden: Email not verified' });
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
