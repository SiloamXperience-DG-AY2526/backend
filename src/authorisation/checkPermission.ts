import { Request } from 'express';
import { Role, PermissionContext } from './types';
import { Permission, PERMISSIONS } from './permissions';
import { hasRolePermission } from './roles';

export const checkPermission = async (
  userId: string,
  role: Role,
  permission: Permission,
  req: Request
): Promise<boolean> => {
  // 1. Check if role has this permission
  if (!hasRolePermission(role, permission)) {
    return false;
  }

  // 2. Run granular permission check
  const permissionHandler = PERMISSIONS[permission];
  const context: PermissionContext = { userId, role, req };

  return await permissionHandler(context);
};
