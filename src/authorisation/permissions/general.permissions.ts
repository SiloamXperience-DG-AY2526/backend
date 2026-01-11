import { PermissionHandler } from '../types';
import { nothingElse } from '../helper';


export const generalPermissions = {
  'volunteerProjects:manage': nothingElse,
} satisfies Record<string, PermissionHandler>;
