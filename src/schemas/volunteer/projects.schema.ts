import { z } from 'zod';

// Query params schema
export const GetAvailableVolunteerActivitiesSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine(
      (val) => Number.isInteger(val) && val > 0,
      { message: 'Page must be a positive integer greater than 0' }
    ),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine(
      (val) => Number.isInteger(val) && val > 0,
      { message: 'Limit must be a positive integer greater than 0' }
    ),

  search: z.string().trim().min(1).optional(),
});

export type GetAvailableVolunteerActivitiesInput = z.infer<
  typeof GetAvailableVolunteerActivitiesSchema
>;

// Response types
export type VolunteerActivityPosition = {
  id: string;
  title: string;
  slots: number;
  filled: number;
  availableSlots: number;
};

export type VolunteerActivity = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  positions: VolunteerActivityPosition[];
};

export type PaginatedVolunteerActivities = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: VolunteerActivity[];
};
