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
    'volunteer-project:create',
    'volunteer-project:view:own',
    'volunteer-project:update:own',
    'donation-project:create',
    'donation-project:view:own',
    'donation-project:update:own',
  ],

  generalManager: [
    'volunteer-project:create',
    'volunteer-project:view:own',
    'volunteer-project:update:own',
    'donation-project:create',
    'donation-project:view:own',
    'donation-project:update:own',
  ],
  financeManager: [
    'donation-project:create',
    'donation-project:view:own',
    'donation-project:update:own',
    'proposedProjects:view', 
    'proposedProjects:update:status'
  ],

  partner: [
    'volunteer-project:create',
    'volunteer-project:view:own',
    'volunteer-project:update:own',
    'donation-project:create',
    'donation-project:view:own',
    'donation-project:update:own',
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
