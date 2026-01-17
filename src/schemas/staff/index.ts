import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const UserRoleEnum = z.enum(
  Object.values(UserRole) as [UserRole, ...UserRole[]]
);

export const createStaffSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string(),
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

export const staffIdSchema = z.object({
  staffId: z.uuid(),
});

export function mapStaffToResponse(user: any) {
  return {
    id: user.id,
    title: user.title,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,

    // convert projects → string[]
    managedProjects: user.managedProjects.map(
      (project: { title: string }) => project.title
    ),
  };
}