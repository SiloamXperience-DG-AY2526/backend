import { nothingElse } from '../helper';
import { PermissionHandler } from '../types';
import { prisma } from '../../lib/prisma';
import { getUserIdFromRequest } from '../../utils/user';

export const volunteerPermissions = {
  'volunteerApplications:view:all': nothingElse,
  'volunteerProjects:duplicate': nothingElse,
  'volunteerProjFeedback:post': nothingElse,
  'volunteerProjFeedback:post:own': async ({ req }) => {
    const userId = getUserIdFromRequest(req);
    const {projectId} = req.params;
    //must have volunteered in this project to give feedback
    const volunteers = await prisma.volunteerProjectPosition.findFirst({ 
      where: { 
        volunteerId: userId,
        position: {
          projectId: projectId,
        } 
      }
    });
    const isVolunteer = Boolean(volunteers);
    return isVolunteer;
  }, 
} satisfies Record<string, PermissionHandler>;
