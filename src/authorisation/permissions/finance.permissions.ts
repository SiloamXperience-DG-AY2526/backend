import { nothingElse } from '../helper';
import { PermissionHandler } from '../types';

export const financePermissions = {
  'overview:view': nothingElse,
  'project:update:own': async ({ req }) => {
    req.params.projectId;
    // Check if project belongs to user
    // const project = await prisma.project.findUnique({ where: { id: projectId, createdById: userId } });
    // return !!project;
    return true; // Placeholder
  },
} satisfies Record<string, PermissionHandler>;
