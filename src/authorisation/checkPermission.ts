import { Request } from 'express';
import { Permission, PermissionsMap } from './permissions';

import { directPermissions, roleHierarchy } from './permissions/config';
import { Role, VALID_ROLES } from './permissions/config';

/**
 * Checks if the role has specific permissions
 * @param role
 * @param permission
 */
export const hasRolePermission = (
  role: string,
  permission: Permission
): boolean => {
  // Validate role before processing
  if (!isValidRole(role)) {
    return false;
  }

  // Check own permissions
  if (directPermissions[role].includes(permission)) {
    return true;
  }

  // Check inherited permissions
  return roleHierarchy[role].some((inheritedRole) =>
    directPermissions[inheritedRole].includes(permission)
  );
};

export function isValidRole(role: string): role is Role {
  return VALID_ROLES.includes(role as Role);
}

/**
 * createCheckPermission returns an asynchronous createCheck(userId, role, permission, req) method.
 *
 * Dependency injection is used for testability.
 *
 * To use:
 *
 * const createCheck = createCheckPermission(PERMISSIONS);
 *
 * await createCheck(...)
 */
export const createCheckPermission = (permissionsMap: PermissionsMap) => {
  return async (
    userId: string,
    role: string,
    permission: Permission,
    req: Request
  ): Promise<boolean> => {
    // Skip invalid roles
    if (!isValidRole(role)) {
      return false;
    }

    // 1. Check if role has this permission
    if (!hasRolePermission(role, permission)) {
      return false;
    }

    // 2. Run granular permission check
    const permissionHandler = permissionsMap[permission];
    const context = { userId, role, req };
    const hasPermission = await permissionHandler(context);
    return hasPermission;
  };
};
