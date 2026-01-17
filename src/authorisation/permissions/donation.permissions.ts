import { nothingElse } from '../helper';
import { PermissionHandler } from '../types';

export const donationPermissions = {
  'donationReceiptStatus:update': nothingElse,
  'donationProjects:duplicate': nothingElse,
  'donationProjectDetails:view': nothingElse,
  'example:view': nothingElse,
  'proposedProjects:view': nothingElse,
  'proposedProjects:update:status': nothingElse,
  'donorDetails:view': nothingElse,
  'example:update:own': async ({ req }) => {
    req.params.projectId;
    // Check if project belongs to user
    // const project = await prisma.project.findUnique({ where: { id: projectId, createdById: userId } });
    // return !!project;
    return true; // Placeholder
  },
} satisfies Record<string, PermissionHandler>;
