import { Permission } from '.';

//DEV: Add new roles here if needed
export const VALID_ROLES = [
  'superAdmin',
  'generalManager',
  'financeManager',
  'partner',
] as const;

// Infer Role type from VALID_ROLES
export type Role = (typeof VALID_ROLES)[number];

/**
 * For developers creating new permissions, you should map it to the role of least privilege.
 *
 * For example, if only superAdmin and financeManager can delete donationProjects, then the
 * least privileged role is financeManager and thus, financeManager should have the permission
 * of 'donationProjects:delete'.
 * .
 */
export const directPermissions: Record<Role, Permission[]> = {
  //DEV: map a permission to a role here
  superAdmin: ['overview:view'],

  generalManager: [],

  financeManager: [],

  partner: ['project:update:own'],
};

//
/**
 * Single layer role hierarchy for convenience.
 *
 * Should not have to change frequently.
 */
export const roleHierarchy: Record<Role, Role[]> = {
  superAdmin: ['generalManager', 'financeManager', 'partner'],
  generalManager: ['partner'],
  financeManager: ['partner'],
  partner: [], // base role, no inheritance
};
