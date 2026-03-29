import { Prisma, UserRole } from '@prisma/client';
import { BadRequestError, ForbiddenError } from '../utils/errors';
import { prisma } from '../prisma/client';
import { mapStaffToResponse } from '../schemas/staff';
import { Role } from '../authorisation/permissions/config';

export async function createStaffUser(
  firstName: string,
  lastName: string,
  title: string,
  email: string,
  passwordHash: string,
  role: UserRole,
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
        role,
        mustChangePassword: true // force password reset
      },
    });

      return user;
    },
  );

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

// Get all staff visible to the caller.
// superAdmin sees subAdmins + generalManagers + financeManagers.
// subAdmin sees only generalManagers + financeManagers.
export async function getAllStaff(callerRole: Role) {
  const visibleRoles: UserRole[] =
    callerRole === UserRole.superAdmin
      ? [UserRole.subAdmin, UserRole.generalManager, UserRole.financeManager]
      : [UserRole.generalManager, UserRole.financeManager];

  const staff = await prisma.user.findMany({
    where: {
      role: {
        in: visibleRoles,
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
export async function deactivateStaff(userId: string, callerRole: Role) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role === 'partner') {
    throw new BadRequestError('Staff account not found');
  }

  if (
    callerRole === UserRole.subAdmin &&
    (user.role === UserRole.superAdmin || user.role === UserRole.subAdmin)
  ) {
    throw new ForbiddenError(
      'Sub-admin cannot deactivate super admin or sub admin accounts',
    );
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
    },
  });
}

// Activate staff by userId
export async function activateStaff(userId: string, callerRole: Role) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role === 'partner') {
    throw new BadRequestError('Staff account not found');
  }

  if (
    callerRole === UserRole.subAdmin &&
    (user.role === UserRole.superAdmin || user.role === UserRole.subAdmin)
  ) {
    throw new ForbiddenError(
      'Sub-admin cannot activate super admin or sub admin accounts',
    );
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      isActive: true,
    },
  });
}
