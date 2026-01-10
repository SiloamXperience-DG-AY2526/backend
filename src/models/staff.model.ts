import { Prisma } from '@prisma/client';
import type { UserRole } from '@prisma/client';
import { BadRequestError } from '../utils/errors';
import { prisma } from '../prisma/client';

export async function createStaffUser(
  firstName: string,
  lastName: string,
  email: string,
  passwordHash: string,
  role: UserRole
) {

  // Check existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('Account already exists');
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role
      },
    });

    return user;
  });

  return result;
}

export async function findStaffIdByEmail(email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new BadRequestError('Staff account not found');
  }

  return user.id;
}

// Remove staff by userId
export async function removeStaffUser(staffId: string) {
  const user = await prisma.user.findUnique({
    where: { id: staffId },
  });

  if (!user) {
    throw new BadRequestError('Staff account not found');
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.user.delete({
      where: { id: staffId },
    });
  });
}