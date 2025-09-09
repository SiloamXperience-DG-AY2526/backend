import { Request, Response } from 'express';

export const getRoot = (req: Request, res: Response): void => {
  res.json({
    message: 'Welcome to the Express TypeScript Backend API',
    timestamp: new Date().toISOString(),
    status: 'success',
    version: '1.0.0'
  });
};

export const getHealth = (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
};