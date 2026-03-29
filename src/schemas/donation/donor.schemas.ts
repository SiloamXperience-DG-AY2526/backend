import { z } from 'zod';
import { PageLimitType } from '../helper';

export const DonorIdSchema = z.object({
  donorId: z.uuid(),
});

// Schema for getting donation history with filters
export const DonorQuerySchema = z.object({
  ...PageLimitType,
  search: z.string().optional(),
});

export type DonorQueryType = z.infer<typeof DonorQuerySchema>;

export const DonorDetailQuerySchema = z.object({
  donorId: z.uuid(),
  ...PageLimitType,
});

export type DonorDetailQueryType = z.infer<typeof DonorDetailQuerySchema>;

export const UpdateDonorSchema = z.object({
  title: z.string().optional().nullable(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  gender: z.enum(['male', 'female', 'others']).optional(),
  dob: z.coerce.date().optional().nullable(),
  occupation: z.string().min(1).optional(),
  nationality: z.string().min(1).optional(),
  contactNumber: z.string().min(1).optional(),
  contactModes: z
    .array(z.enum(['email', 'whatsapp', 'telegram', 'messenger', 'phoneCall']))
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateDonorInput = z.infer<typeof UpdateDonorSchema>;
