import { z } from 'zod';

export const SubmitVolunteerApplicationSchema = z.object({
  userId: z.uuid(),
  positionId: z.uuid(),
  sessionId: z.uuid().optional(),

  name: z.string(),
  gender: z.string(),
  contactNumber: z.string(),
});

export type SubmitVolunteerApplicationInput = z.infer<
  typeof SubmitVolunteerApplicationSchema
>;

//get application
export const GetVolunteerApplicationsParamsSchema = z.object({
  userId: z.string().uuid(),
});
export const GetVolunteerApplicationsQuerySchema = z.object({
  status: z
    .enum(['reviewing', 'approved', 'rejected', 'active', 'inactive'])
    .optional(),
});

export type GetVolunteerApplicationsQueryInput = z.infer<
  typeof GetVolunteerApplicationsQuerySchema
>;
