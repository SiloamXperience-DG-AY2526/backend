import { donationPermissions } from './donation.permissions';
import { PermissionHandler } from '../types';
import { volunteerPermissions } from './volunteer.permissions';
import { staffPermissions } from './staff.permissions';

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
  ...staffPermissions,
  // DEV: Add other permission groups here
} satisfies PermissionsMap;
