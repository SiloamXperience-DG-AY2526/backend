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
    'example:view',
    'staff:read',
    'staff:create',
    'staff:activate',
    'staff:deactivate',
    'partners:view',
  ],

  [UserRole.generalManager]: [
    'volunteerApplications:view:all',
    'volunteerProjFeedback:post',
    'volunteerProjects:duplicate',
    'volunteerProjApproval:update',
    'volunteerProjects:manage',
    'partners:view',
    'emailCampaign:create',
    'emailCampaign:update',
    'emailCampaign:read',
    'emailCampaign:test',
    'emailCampaign:publish',
    'emailCampaign:delete',
  ],

  [UserRole.financeManager]: [
    'donationReceiptStatus:update',
    'donationProjects:duplicate',
    'donationProjectDetails:view',
    'proposedProjects:view',
    'proposedProjects:update:status',
    'donorDetails:view'
  ],

  [UserRole.partner]: [
    'example:update:own',
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
