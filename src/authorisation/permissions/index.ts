import { donationPermissions } from './donation.permissions';
import { PermissionHandler } from '../types';
import { volunteerPermissions } from './volunteer.permissions';
import { emailCampaignPermissions } from './emailCampaign.permissions';


export type PermissionsMap = Record<string, PermissionHandler>;
export type Permission = keyof typeof PERMISSIONS;

/**
 * For developers, extend permission files here.
 *
 * Note: permission names should be defined as 'resource:action:own(optional)'
 */
export const PERMISSIONS = {
  ...donationPermissions,
  ...volunteerPermissions,
  ...emailCampaignPermissions
  // DEV: Add other permission groups here
} satisfies PermissionsMap;
