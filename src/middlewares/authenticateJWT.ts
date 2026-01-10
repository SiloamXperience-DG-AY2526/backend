import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';

/**
 * Middleware that authenticates incoming requests using a JWT.
 *
 * Verifies, decodes and attaches the Bearer token in the Authorization header and
 * Throws 401 Unauthorised if the token is missing or invalid.
 */
export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Unauthorised. Not a Bearer token');
  }

  const token = authHeader.split(' ')[1];

  const validPayload = verifyToken(token);
  req.user = validPayload; // For use by downstream middleware and route handlers

  next();
}
