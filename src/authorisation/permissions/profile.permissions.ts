import { PermissionHandler } from '../types';
import { prisma } from '../../lib/prisma';

const nothingElse = async () => true;

export const checkProfileOwnership: PermissionHandler = async ({
  userId,
  req,
}) => {
  const profileUserId = req.params.userId;
  if (!profileUserId) return false;

  return userId === profileUserId;
};

export const profilePermissions = {
  'profile:view': nothingElse,
  'profile:update:own': async ({ req }) => {
    const userId = req.params.userId;
    // Check for correct user
    const project = await prisma.user.findUnique({ where: { id: userId } });
    return !!project;
    // return true; // Placeholder
  },
} satisfies Record<string, PermissionHandler>;
