import { Permission } from '.';
import { UserRole } from '@prisma/client';

// Use Prisma enum as source of truth for roles
export const VALID_ROLES = Object.values(UserRole);

// Role type derived from Prisma enum
export type Role = UserRole;

const generalManagerPermissions: Permission[] = [
  'volunteerApplications:view:all',
  'volunteerProjFeedback:post',
  'volunteerProjects:duplicate',
  'volunteerProjApproval:update',
  'volunteerProjects:manage',
  'partners:view',
  'partners:deactivate',
  'emailCampaign:create',
  'emailCampaign:update',
  'emailCampaign:read',
  'emailCampaign:test',
  'emailCampaign:publish',
  'emailCampaign:delete',
];

const financeManagerPermissions: Permission[] = [
  'donationReceiptStatus:update',
  'donationProjects:manage',
  'partners:view',
  'donationProjects:duplicate',
  'donationProjectDetails:view',
  'proposedProjects:view',
  'proposedProjects:update:status',
  'donorDetails:view',
  'donorDetails:manage',
  'emailCampaign:update',
  'emailCampaign:template',
  'emailCampaign:send',
];

/**
 * Sub-admin has the staff management permissions and example:view.
 * Super-admin inherits these from sub-admin — do not duplicate them.
 */
const subAdminPermissions: Permission[] = [
  'example:view',
  'staff:read',
  'staff:create',
  'staff:activate',
  'staff:deactivate',
];

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

  // superAdmin has no direct permissions — it inherits everything via roleHierarchy.
  [UserRole.superAdmin]: [],

  // subAdmin owns staff management permissions; superAdmin inherits them.
  [UserRole.subAdmin]: subAdminPermissions,

  [UserRole.generalManager]: generalManagerPermissions,

  [UserRole.financeManager]: financeManagerPermissions,

  [UserRole.partner]: ['example:update:own', 'volunteerProjFeedback:post:own'],
};
//
/**
 * Single layer role hierarchy for convenience.
 *
 * Should not have to change frequently.
 *
 * Note: the resolver is single-level
 */
export const roleHierarchy: Record<Role, Role[]> = {
  [UserRole.superAdmin]: [
    UserRole.subAdmin,
    UserRole.generalManager,
    UserRole.financeManager,
    UserRole.partner,
  ],
  [UserRole.subAdmin]: [
    UserRole.generalManager,
    UserRole.financeManager,
    UserRole.partner,
  ],
  [UserRole.generalManager]: [UserRole.partner],
  [UserRole.financeManager]: [UserRole.partner],
  [UserRole.partner]: [], // base role, no inheritance
};