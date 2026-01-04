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
