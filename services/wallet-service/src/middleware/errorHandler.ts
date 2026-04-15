import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@hypervault/shared';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '),
    };
    res.status(400).json(response);
    return;
  }

  console.error('[error]', err.message);

  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  };
  res.status(500).json(response);
}
