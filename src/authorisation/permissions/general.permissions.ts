import { PermissionHandler } from '../types';
import { nothingElse } from '../helper';


export const generalPermissions = {
    'volunteerProjects:view': nothingElse,
    'volunteerProjects:manage': nothingElse,
} satisfies Record<string, PermissionHandler>;
