import { Prisma } from '@prisma/client';
import type { UserRole } from '@prisma/client';
import { BadRequestError } from '../utils/errors';
import { prisma } from '../prisma/client';
import { mapStaffToResponse } from '../schemas/staff';

export async function createStaffUser(
  firstName: string,
  lastName: string,
  title: string,
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
        title,
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

// Get all active and non active staff
export async function getAllStaff() {
  const staff = await prisma.user.findMany({
    where: {
      role: {
        in: ['generalManager', 'financeManager'],
      },
    },
    include: {
      managedProjects: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return staff.map(mapStaffToResponse);
}

// Deactivate staff by userId
export async function deactivateStaff(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (
    !user ||
    user.role === 'partner'
  ) {
    throw new BadRequestError('Staff account not found');
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
    },
  });
}

// Activate staff by userId
export async function activateStaff(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (
    !user ||
    user.role === 'partner'
  ) {
    throw new BadRequestError('Staff account not found');
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      isActive: true,
    },
  });
}