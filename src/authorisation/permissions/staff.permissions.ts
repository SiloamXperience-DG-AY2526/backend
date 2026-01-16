import { nothingElse } from '../helper';
import { PermissionHandler } from '../types';

export const staffPermissions = {
  'staff:create': nothingElse,
  'staff:read': nothingElse,
  'staff:activate': nothingElse,
  'staff:deactivate': nothingElse
} satisfies Record<string, PermissionHandler>;
