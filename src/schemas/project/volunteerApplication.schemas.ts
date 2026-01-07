import { z } from 'zod';
import {
  VolunteerProjectPositionStatus
} from '@prisma/client';

export const GetVolunteerApplicationsQuerySchema = z.object({
  status: z
    .enum(VolunteerProjectPositionStatus)
    .optional(),
});

export type GetVolunteerApplicationsInput = {
    userId: string, 
    filters: z.infer<
  typeof GetVolunteerApplicationsQuerySchema
>;
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
