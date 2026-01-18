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
  projectId: z.uuid(),
  positionId: z.uuid(),
  hasConsented: z.boolean(),
  availability: z.string().trim().min(1).optional(),
  sessionIds: z.array(z.uuid()).default([]),
});

export type SubmitVolApplicationInput = {
  userId: string;
  applicationDetails: z.infer<typeof SubmitVolunteerApplicationSchema>;
};

// Match volunteer to project
export const MatchVolunteerToProjectSchema = z.object({
  volunteerId: z.uuid(),
  projectId: z.uuid(),
  positionId: z.uuid().optional(),
});

export type MatchVolunteerToProjectInput = z.infer<typeof MatchVolunteerToProjectSchema>;

// Approve volunteer match
export const ApproveVolunteerMatchSchema = z.object({
  approvalNotes: z.string().optional(),
  approvalMessage: z.string().optional(),
});

export type ApproveVolunteerMatchInput = z.infer<typeof ApproveVolunteerMatchSchema>;

export const UpdateVolunteerApplicationStatusSchema = z.object({
  status: z.enum(VolunteerProjectPositionStatus),
});

export type UpdateVolunteerApplicationStatusInput = z.infer<
  typeof UpdateVolunteerApplicationStatusSchema
>;

// Schema for matchId param
export const MatchIdSchema = z.object({
  matchId: z.uuid(),
}); 
