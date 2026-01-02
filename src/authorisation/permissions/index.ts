import { financePermissions } from './finance.permissions';
import { PermissionHandler } from '../types';

export type PermissionsMap = Record<string, PermissionHandler>;
export type Permission = keyof typeof PERMISSIONS;

/**
 * For developers, extend permission files here.
 *
 * Note: permission names should be defined as 'resource:action:own(optional)'
 */
export const PERMISSIONS = {
  ...financePermissions,
  // DEV: Add other permission groups here
} satisfies PermissionsMap;
