import { z } from 'zod';
import {
  ProjectType,
  SubmissionStatus,
  ProjectApprovalStatus,
} from '@prisma/client';
import { LimitType, PageType, preprocessDate } from '../helper';

export const CreateDonationProjectSchema = z.object({
  title: z.string().min(1),
  location: z.string().min(1),
  about: z.string().min(1),
  objectives: z.string().min(1),
  beneficiaries: z.string().optional().nullable(),
  initiatorName: z.string().optional().nullable(),
  organisingTeam: z.string().optional().nullable(),
  targetFund: z
    .union([z.number().positive(), z.string()])
    .optional()
    .nullable(),
  brickSize: z.union([z.number().positive(), z.string()]).optional().nullable(),
  deadline: preprocessDate,
  type: z.nativeEnum(ProjectType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
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

export type CreateDonationProjectInput = z.infer<
  typeof CreateDonationProjectSchema
>;

export const DonationProjectIdSchema = z.object({
  projectId: z.uuid(),
});

export const UpdateDonationProjectSchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  about: z.string().optional(),
  objectives: z.string().optional(),
  beneficiaries: z.string().optional().nullable(),
  initiatorName: z.string().optional().nullable(),
  organisingTeam: z.string().optional().nullable(),
  // Prisma Decimal accepts number, string, or Decimal
  targetFund: z
    .union([z.number().positive(), z.string()])
    .optional()
    .nullable(),
  brickSize: z.union([z.number().positive(), z.string()]).optional().nullable(),
  deadline: preprocessDate,
  type: z.nativeEnum(ProjectType).optional(),
  startDate: preprocessDate,
  endDate: preprocessDate,
  submissionStatus: z.nativeEnum(SubmissionStatus).optional(),
  approvalStatus: z.nativeEnum(ProjectApprovalStatus).optional(),
  approvalNotes: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  attachments: z.string().optional().nullable(),
});

export type UpdateDonationProjectInput = z.infer<
  typeof UpdateDonationProjectSchema
>;

// Schema for getting all donation projects with filters
export const getDonationProjectsSchema = z.object({
  type: z.enum(ProjectType).optional(),
  page: PageType,
  limit: LimitType,
});

export type GetDonationProjectsInput = z.infer<
  typeof getDonationProjectsSchema
>;

export const UpdateProposedProjectStatusSchema = z.object({
  status: z.enum(ProjectApprovalStatus),
});

export const GetProjectDonationsSchema = z.object({
  page: PageType,
  limit: LimitType,
});

export type GetProjectDonationsInput = z.infer<typeof GetProjectDonationsSchema>;

export const GetProjectDonorsSchema = z.object({
  page: PageType,
  limit: LimitType,
});

export type GetProjectDonorsInput = z.infer<typeof GetProjectDonorsSchema>;
