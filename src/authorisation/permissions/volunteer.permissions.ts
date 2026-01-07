import { nothingElse } from '../helper';
import { PermissionHandler } from '../types';

export const volunteerPermissions = {
  'volunteerProjectApplications:view:all': nothingElse,
} satisfies Record<string, PermissionHandler>;
