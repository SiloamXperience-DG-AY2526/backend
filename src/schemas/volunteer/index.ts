export * from './application.schema';
export * from './projects.schema';

import { z } from 'zod';
import {
  ProjectFrequency,
  ProjectOperationStatus,
  ProjectApprovalStatus,
} from '@prisma/client';
import { preprocessDate } from '../helper';

// Note: submissionStatus in VolunteerProject is a String, not an enum

export const CreateVolunteerProjectSchema = z.object({
  title: z.string().min(1),
  location: z.string().min(1),
  aboutDesc: z.string().min(1),
  objectives: z.string().min(1),
  beneficiaries: z.string().min(1),
  initiatorName: z.string().optional().nullable(),
  organisingTeam: z.string().optional().nullable(),
  proposedPlan: z.string().optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  frequency: z.nativeEnum(ProjectFrequency),
  interval: z.number().int().positive().optional().nullable(),
  dayOfWeek: z.string().optional().nullable(),
  operationStatus: z.nativeEnum(ProjectOperationStatus).default('ongoing'),
  image: z.string().url().optional().nullable(),
  attachments: z.string().optional().nullable(),
  // Objectives list - optional, can be added later
  objectivesList: z
    .array(
      z.object({
        objective: z.string().min(1),
        order: z.number().int().positive(),
      })
    )
    .optional(),
});

export type CreateVolunteerProjectInput = z.infer<
  typeof CreateVolunteerProjectSchema
>;

export const VolunteerProjectIdSchema = z.object({
  projectId: z.uuid(),
});

export const UpdateVolunteerProjectSchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  aboutDesc: z.string().optional(),
  objectives: z.string().optional(),
  beneficiaries: z.string().optional(),
  initiatorName: z.string().optional(),
  organisingTeam: z.string().optional(),
  proposedPlan: z.string().optional(),
  startTime: preprocessDate,
  endTime: preprocessDate,
  startDate: preprocessDate,
  endDate: preprocessDate,
  frequency: z.nativeEnum(ProjectFrequency).optional(),
  interval: z.number().int().positive().optional().nullable(),
  dayOfWeek: z.string().optional().nullable(),
  submissionStatus: z.string().optional(),
  approvalStatus: z.nativeEnum(ProjectApprovalStatus).optional(),
  operationStatus: z.nativeEnum(ProjectOperationStatus).optional(),
  approvalNotes: z.string().optional().nullable(),
  approvalMessage: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  attachments: z.string().optional().nullable(),
});

export type UpdateVolunteerProjectInput = z.infer<
  typeof UpdateVolunteerProjectSchema
>;

