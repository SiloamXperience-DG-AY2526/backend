import { financePermissions } from './finance.permissions';
import { PermissionHandler } from '../types';

// note to developers: permission names should be defined as 'resource:action:own(optional)'

export const PERMISSIONS = {
  ...financePermissions,
  // Add other permission groups here
} satisfies Record<string, PermissionHandler>;

export type Permission = keyof typeof PERMISSIONS;
