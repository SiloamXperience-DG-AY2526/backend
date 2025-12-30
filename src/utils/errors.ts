import { AppError } from '../middlewares/errorHandler';
import { z, ZodError } from 'zod';

export class ValidationError extends AppError {
  errors: any;

  constructor(message: string, errors: any) {
    super(message, 400);
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ServerError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export const formatZodErrors = (error: ZodError) => {
  return z.flattenError(error);
};
