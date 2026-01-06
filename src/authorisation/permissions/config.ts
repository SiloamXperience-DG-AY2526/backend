import { Permission } from '.';
import { UserRole } from '@prisma/client';

// Use Prisma enum as source of truth for roles
export const VALID_ROLES = Object.values(UserRole);

// Role type derived from Prisma enum
export type Role = UserRole;

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
  [UserRole.superAdmin]: [
    'overview:view',
    'project:update:own',
    'volunteer-project:create',
    'volunteer-project:view:own',
    'volunteer-project:update:own',
    'donation-project:create',
    'donation-project:view:own',
    'donation-project:update:own',
  ],

  [UserRole.generalManager]: [
    'volunteer-project:create',
    'volunteer-project:view:own',
    'volunteer-project:update:own',
    'donation-project:create',
    'donation-project:view:own',
    'donation-project:update:own',
  ],

  [UserRole.financeManager]: [
    'donation-project:create',
    'donation-project:view:own',
    'donation-project:update:own',
    'proposedProjects:view',
    'proposedProjects:update:status',
  ],

  [UserRole.partner]: [
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
  [UserRole.superAdmin]: [UserRole.generalManager, UserRole.financeManager, UserRole.partner],
  [UserRole.generalManager]: [UserRole.partner],
  [UserRole.financeManager]: [UserRole.partner],
  [UserRole.partner]: [], // base role, no inheritance
};
