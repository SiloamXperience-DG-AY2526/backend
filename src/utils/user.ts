import { Request } from 'express';

/**
 * Extracts user ID from JWT token in request
 * TODO: Replace with actual JWT extraction when authentication is implemented
 */
export const getUserIdFromRequest = (req: Request): string => {
  // TODO: Extract from actual JWT token
  // For now, using the same placeholder as requirePermission middleware
  // This should be replaced with actual JWT parsing
  req;
  return 'user-123';
};

