import { z } from 'zod';
import {
  ProjectFrequency
} from '@prisma/client';
import { preprocessDate } from '../helper';
export const SubmitVolunteerApplicationSchema = z.object({
  userId: z.uuid(),
  positionId: z.uuid(),
  sessionId: z.uuid().optional(),

  
});

//submit volunteer interest
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

// Query params schema for available activities
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


//volunteer propose project
export const ProposeVolunteerProjectSchema = z.object({
  userId: z.uuid(), //not supposed to be here get it from user later on
  title: z.string().min(1),
  location: z.string().min(1),

  aboutDesc: z.string().min(1), 
  objectives: z.string().min(1),
  beneficiaries: z.string().min(1),

  initiatorName: z.string().optional(),
  organisingTeam: z.string().optional(),

  proposedPlan: z.string().optional(),

  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),

  frequency: z.nativeEnum(ProjectFrequency),
  interval: z.number().int().positive().optional().nullable(),
  dayOfWeek: z.string().optional().nullable(),

  image: z.string().url().optional().nullable(),
  attachments: z.string().optional().nullable(), // doc link or email info

  //volunteer positions
  positions: z
    .array(
      z.object({
        role: z.string().min(1),
        description: z.string().min(1),
        skills: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

export type ProposeVolunteerProjectInput = z.infer<
  typeof ProposeVolunteerProjectSchema
>;



export const UpdateVolunteerProposalSchema = z.object({
  userId: z.uuid(), //  remove when auth is ready

  title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),

  aboutDesc: z.string().optional(),
  objectives: z.string().optional(),
  beneficiaries: z.string().optional(),

  initiatorName: z.string().optional().nullable(),
  organisingTeam: z.string().optional().nullable(),
  proposedPlan: z.string().optional().nullable(),

  startTime: preprocessDate.optional(),
  endTime: preprocessDate.optional(),
  startDate: preprocessDate.optional(),
  endDate: preprocessDate.optional(),

  frequency: z.nativeEnum(ProjectFrequency).optional(),
  interval: z.number().int().positive().optional().nullable(),
  dayOfWeek: z.string().optional().nullable(),

  image: z.string().url().optional().nullable(),
  attachments: z.string().optional().nullable(),

  positions: z
    .array(
      z.object({
        role: z.string().min(1),
        description: z.string().min(1),
        skills: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

export type UpdateVolunteerProposalInput = z.infer<
  typeof UpdateVolunteerProposalSchema
>;

export const WithdrawVolunteerProposalSchema = z
  .object({
    userId: z.uuid(), //from body (until auth is available)
  })
  .strict();


export type WithdrawVolunteerProposalInput = z.infer<
  typeof WithdrawVolunteerProposalSchema
>;

export const SubmitVolunteerFeedbackSchema = z
  .object({
    userId: z.string().uuid(), // TEMP: from body

    ratings: z.object({
      overall: z.number().int().min(1).max(5),
      management: z.number().int().min(1).max(5),
      planning: z.number().int().min(1).max(5),
      facilities: z.number().int().min(1).max(5),
    }),

    feedback: z.object({
      experience: z.string().trim().min(1).max(2000),
      improvement: z.string().trim().min(1).max(2000),
      comments: z.string().trim().max(2000).optional().nullable(),
    }),

    submittedAt: z.string().datetime().optional(), 
  })
  .strict();

export type SubmitVolunteerFeedbackInput = z.infer<
  typeof SubmitVolunteerFeedbackSchema
>;