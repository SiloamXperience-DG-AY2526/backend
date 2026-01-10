import { prisma } from '../lib/prisma';
import { StaffProfile } from '../schemas/user';
import { BadRequestError } from '../utils/errors';

export const updatePassword = async (userId: string, passwordHash: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

export const getStaffProfile = async (userId: string): Promise<StaffProfile | null> => {
  const staff = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      title: true,
      email: true,
    },
  });

  if (!staff) throw new BadRequestError('Error retrieving Staff profile');

  return {
    ...staff, 
    title: staff.title ?? undefined
  };
};

export async function updateStaffProfile(
  userId: string,
  newStaffProfile: StaffProfile
) {

  await prisma.user.update({
    where: { id: userId },
    data: newStaffProfile
  });

}