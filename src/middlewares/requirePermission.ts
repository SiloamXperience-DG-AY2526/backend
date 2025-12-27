import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { Permission } from '../authorisation/permissions';
import { checkPermission } from '../authorisation/checkPermission';
import { Role } from '../authorisation/types';

const extractJWT = (_req: Request) => {
  // TODO: Extract from actual JWT
  const userId = 'user-123';
  const role: Role = 'superAdmin';
  return { userId, role };
};

export const requirePermission = (permission: Permission) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { userId, role } = extractJWT(req);
      const isAuthorized = await checkPermission(userId, role, permission, req);

      if (!isAuthorized) {
        throw new UnauthorizedError('Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAnyPermission = (permissions: Permission[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { userId, role } = extractJWT(req);
      const results = await Promise.allSettled(
        permissions.map((p) => checkPermission(userId, role, p, req))
      );

      const hasAnyPermission = results.some(
        (result) => result.status === 'fulfilled' && result.value === true
      );

      if (!hasAnyPermission) {
        throw new UnauthorizedError('Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
