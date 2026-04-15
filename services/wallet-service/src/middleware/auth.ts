import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.user = { userId: payload.userId };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
