import { z } from 'zod';

//create application
export const SubmitVolunteerApplicationSchema = z.object({
  userId: z.uuid(),
  projectPositionId: z.uuid(),
});

export type SubmitVolunteerApplicationInput = z.infer<typeof SubmitVolunteerApplicationSchema>;

//get application
export const GetVolunteerApplicationsSchema = z.object({
  userId: z.uuid({ message: 'Invalid user ID' }),
});

export type GetVolunteerApplicationsInput = z.infer<typeof GetVolunteerApplicationsSchema>;

//  output type
export type VolunteerApplication = {
  projectId: string;
  projectTitle: string;
  position: string;
  submittedAt: Date;
  status: 'PENDING' | 'PROCESSED';
  approvedAt: Date | null;
  approvedBy: string | null;
  approvalNotes: string | null;
};

export type GetVolunteerApplicationsOutput = {
  userId: string;
  applications: VolunteerApplication[];
};


