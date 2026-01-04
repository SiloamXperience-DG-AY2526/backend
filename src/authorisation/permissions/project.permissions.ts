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
  'donation-project:update:own': checkDonationProjectOwnership,
} satisfies Record<string, PermissionHandler>;

