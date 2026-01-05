import { PermissionHandler } from '../types';


export const generalPermissions = {
  'view_volunteer_projects': async ({ userId }) => {
    // Example permission logic: allow general manager to view all volunteer projects
    userId;
    return true;
  },
} satisfies Record<string, PermissionHandler>;