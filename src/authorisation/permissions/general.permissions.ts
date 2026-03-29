import { PermissionHandler } from '../types';
import { nothingElse } from '../helper';


export const generalPermissions = {
  'partners:view': nothingElse,
  'partners:deactivate': nothingElse,
  'volunteerProjects:manage': nothingElse,
} satisfies Record<string, PermissionHandler>;
