<<<<<<< HEAD
import { financePermissions } from './finance.permissions';
import { projectPermissions } from './project.permissions';
import { profilePermissions } from './profile.permissions';
=======
import { donationPermissions } from './donation.permissions';
>>>>>>> main
import { PermissionHandler } from '../types';

export type PermissionsMap = Record<string, PermissionHandler>;
export type Permission = keyof typeof PERMISSIONS;

/**
 * For developers, extend permission files here.
 *
 * Note: permission names should be defined as 'resource:action:own(optional)'
 */
export const PERMISSIONS = {
<<<<<<< HEAD
  ...financePermissions,
  ...projectPermissions,
  ...profilePermissions,
=======
  ...donationPermissions,
>>>>>>> main
  // DEV: Add other permission groups here
} satisfies PermissionsMap;
