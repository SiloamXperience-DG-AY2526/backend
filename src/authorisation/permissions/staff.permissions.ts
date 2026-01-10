import { nothingElse } from '../helper';
import { PermissionHandler } from '../types';

export const staffPermissions = {
    'staff:create': nothingElse,
} satisfies Record<string, PermissionHandler>;
