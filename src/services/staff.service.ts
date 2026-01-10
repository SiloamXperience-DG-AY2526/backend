import { UserRole } from '@prisma/client';
import { hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { createStaffUser, removeStaffUser } from '../models/staff.model';

export async function createStaffAccount(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: UserRole
) {
  const passwordHash = await hashPassword(password);

  const user = await createStaffUser(firstName, lastName, email, passwordHash, role);

  // Create token for the new user
  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return token;
}

export async function removeStaffAccount(staffId: string) {
  await removeStaffUser(staffId);
}