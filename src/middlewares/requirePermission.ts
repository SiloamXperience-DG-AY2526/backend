import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { Permission, PERMISSIONS } from '../authorisation/permissions';
import { createCheckPermission } from '../authorisation/checkPermission';

export const checkPermission = createCheckPermission(PERMISSIONS);

const extractJWT = (req: Request) => {
  if (!req.user)
    throw new UnauthorizedError(
      'User is not authenticated. Login and try again.'
    );
  return req.user;
};

export const requirePermission = (permission: Permission) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { userId, role } = extractJWT(req);
      const isAuthorized = await checkPermission(
        userId,
        role,
        permission,
        req
      );

      if (!isAuthorized) {
        throw new ForbiddenError('Forbidden');
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
        throw new ForbiddenError('Forbidden');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
