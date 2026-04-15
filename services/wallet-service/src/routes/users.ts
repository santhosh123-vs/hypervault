import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { ApiResponse } from '@hypervault/shared';
import { config } from '../config';
import { User } from '../models/User';
import { registerSchema, loginSchema } from '../schemas/validation';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) {
      const response: ApiResponse = { success: false, error: 'Email already registered' };
      res.status(409).json(response);
      return;
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = await User.create({ email, passwordHash });

    const response: ApiResponse<{ userId: string }> = {
      success: true,
      data: { userId: user._id.toString() },
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user) {
      const response: ApiResponse = { success: false, error: 'Invalid credentials' };
      res.status(401).json(response);
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const response: ApiResponse = { success: false, error: 'Invalid credentials' };
      res.status(401).json(response);
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn },
    );

    const response: ApiResponse<{ token: string }> = {
      success: true,
      data: { token },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
