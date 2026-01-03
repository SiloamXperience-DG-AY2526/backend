import { PermissionHandler } from '../types';
import { prisma } from '../../lib/prisma';

// Permission handler to check if user owns a volunteer project
export const checkVolunteerProjectOwnership: PermissionHandler = async ({
  userId,
  req,
}) => {
  const { projectId } = req.params;
  if (!projectId) return false;

  const project = await prisma.volunteerProject.findFirst({
    where: {
      id: projectId,
      managedById: userId,
    },
  });

  return !!project;
};

// Permission handler to check if user owns a donation project
export const checkDonationProjectOwnership: PermissionHandler = async ({
  userId,
  req,
}) => {
  const { projectId } = req.params;
  if (!projectId) return false;

  const project = await prisma.donationProject.findFirst({
    where: {
      id: projectId,
      managedBy: userId,
    },
  });

  return !!project;
};

export const projectPermissions = {
  'volunteer-project:create': async ({ userId }) => {
    // Any authenticated user can create projects (they become the manager)
    return true;
  },
  'volunteer-project:view:own': async ({ userId }) => {
    // Allow viewing own projects - this is handled at the service/model level
    return true;
  },
  'volunteer-project:update:own': checkVolunteerProjectOwnership,
  'donation-project:create': async ({ userId }) => {
    // Any authenticated user can create projects (they become the manager)
    return true;
  },
  'donation-project:view:own': async ({ userId }) => {
    // Allow viewing own projects - this is handled at the service/model level
    return true;
  },
  'donation-project:update:own': checkDonationProjectOwnership,
} satisfies Record<string, PermissionHandler>;

