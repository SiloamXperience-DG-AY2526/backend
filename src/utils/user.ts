import { Request } from 'express';
import { UnauthorizedError } from './errors';
import { JwtPayload } from '../utils/jwt';

/**
 * Extracts user ID from JWT token in request
 */
export const getUserIdFromRequest = (req: Request): string => {
  const userId = req.user?.userId;
  
  if (!userId) {
    throw new UnauthorizedError('Unauthorized: User is not logged in');
  }

  return userId;
};

/**
 * Extracts user payload from JWT token in request
 */
export const getUserPayloadFromRequest = (req: Request): JwtPayload => {
  const user = req.user;
  
  if (!user) {
    throw new UnauthorizedError('Unauthorized: User is not logged in');
  }

  return user;
};