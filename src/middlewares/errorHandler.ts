import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean; // safe to show client

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      status: 'error',
      message: this.message,
    };
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (res.headersSent) {
    // If a response has already started, delegate to default Express error handler
    return next(err);
  }

  // Known operational errors
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json(err.toJSON());
  }

  // Unexpected errors
  const message = //do not expose in production
    process.env.NODE_ENV === 'development'
      ? getErrorMessage(err)
      : 'Internal server error';

  res.status(500).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Internal Server Error';
}
