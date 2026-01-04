import { Permission } from './permissions';
import { Role } from './types';

// Single layer hierarchy for convenience
const roleHierarchy: Record<Role, Role[]> = {
  superAdmin: ['generalManager', 'financeManager', 'partner'],
  generalManager: ['partner'],
  financeManager: ['partner'],
  partner: [], // base role, no inheritance
};

// Role to permissions mapping
const directPermissions: Record<Role, Permission[]> = {
  //add more permissions here
  superAdmin: [
    'overview:view',
    'project:update:own',
  ],

  generalManager: [
  ],

  financeManager: [
  ],

  partner: [
  ],
};

export const hasRolePermission = (
  role: Role,
  permission: Permission
): boolean => {
  // Check own permissions
  if (directPermissions[role].includes(permission)) {
    return true;
  }

  // Check inherited permissions
  return roleHierarchy[role].some((inheritedRole) =>
    directPermissions[inheritedRole].includes(permission)
  );
};
