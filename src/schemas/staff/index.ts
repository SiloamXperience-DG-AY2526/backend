import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const UserRoleEnum = z.enum(
  Object.values(UserRole) as [UserRole, ...UserRole[]]
);

export const createStaffSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  role: UserRoleEnum.refine(
    (role) => role !== UserRole.partner,
    'Staff role cannot be partner'
  ),
});