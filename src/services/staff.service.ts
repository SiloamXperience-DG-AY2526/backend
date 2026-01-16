import { UserRole } from '@prisma/client';
import { hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { createStaffUser, deactivateStaff, activateStaff, getAllStaff } from '../models/staff.model';

export async function createStaffAccount(
  firstName: string,
  lastName: string,
  title: string,
  email: string,
  password: string,
  role: UserRole
) {
  const passwordHash = await hashPassword(password);

  const user = await createStaffUser(firstName, lastName, title, email, passwordHash, role);

  // Create token for the new user
  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return token;
}

export async function deactivateStaffAccount(staffId: string) {
  return deactivateStaff(staffId);
}

export async function activateStaffAccount(staffId: string) {
  return activateStaff(staffId);
}

export async function getAllStaffAccount() {
  return getAllStaff();
}