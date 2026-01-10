import { nothingElse } from '../helper';
import { PermissionHandler } from '../types';

export const staffPermissions = {
    'staff:create': nothingElse,
    'staff:remove': nothingElse
} satisfies Record<string, PermissionHandler>;
