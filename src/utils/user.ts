import { Request } from 'express';
import { UnauthorizedError } from './errors';

/**
 * Extracts user ID from JWT token in request
 * TODO: Replace with actual JWT extraction when authentication is implemented
 */
export const getUserIdFromRequest = (req: Request): string => {
  const userId = req.user?.userId;
  
  if (!userId) {
    throw new UnauthorizedError('Unauthorized: User is not logged in');
  }

  return userId;
};

