import { UserRole } from '@prisma/client';
import { hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import {
  createStaffUser,
  deactivateStaff,
  activateStaff,
  getAllStaff,
} from '../models/staff.model';
import { ForbiddenError } from '../utils/errors';
import { Role } from '../authorisation/permissions/config';

export async function createStaffAccount(
  firstName: string,
  lastName: string,
  title: string,
  email: string,
  password: string,
  role: UserRole,
  callerRole: Role,
) {
  // subAdmin cannot create superAdmin or subAdmin accounts
  if (
    callerRole === UserRole.subAdmin &&
    (role === UserRole.superAdmin || role === UserRole.subAdmin)
  ) {
    throw new ForbiddenError(
      'Sub-admin cannot create super admin or sub admin accounts',
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await createStaffUser(
    firstName,
    lastName,
    title,
    email,
    passwordHash,
    role,
  );

  // Create token for the new user
  // Staff users are considered onboarded by default (they don't need partner profile)
  const token = signToken({
    userId: user.id,
    role: user.role,
    hasOnboarded: true,
  });

  return token;
}

export async function deactivateStaffAccount(
  staffId: string,
  callerRole: Role,
) {
  return deactivateStaff(staffId, callerRole);
}

export async function activateStaffAccount(staffId: string, callerRole: Role) {
  return activateStaff(staffId, callerRole);
}

export async function getAllStaffAccount(callerRole: Role) {
  return getAllStaff(callerRole);
}
