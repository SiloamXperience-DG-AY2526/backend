import { z } from 'zod';
import {
  VolunteerProjectPositionStatus
} from '@prisma/client';

export const AnyVolApplicationsQuerySchema = z.object({
  userId: z.uuid().optional(),
  projectId: z.uuid().optional(),
  status: z
    .enum(VolunteerProjectPositionStatus)
    .optional(),
});
export type AnyVolApplicationsQueryType = z.infer<typeof AnyVolApplicationsQuerySchema>;
export type AnyVolApplicationsQueryInput = z.infer<typeof AnyVolApplicationsQuerySchema>;

export const MyVolApplicationsQuerySchema = z.object({
  status: z
    .enum(VolunteerProjectPositionStatus)
    .optional(),
});

export type MyVolApplicationsQueryType = z.infer<typeof MyVolApplicationsQuerySchema>;

export type GetVolunteerApplicationsInput = {
    userId: string, 
    filters: MyVolApplicationsQueryType,
}

export const SubmitVolunteerApplicationSchema = z.object({
  hasConsented: z.boolean(),
  positionId: z.uuid(),
});

//submit volunteer interest
export type SubmitVolApplicationInput = {
    userId: string, 
    applicationDetails: z.infer<
  typeof SubmitVolunteerApplicationSchema
>
} 
