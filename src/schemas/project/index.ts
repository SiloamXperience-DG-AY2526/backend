import { z } from 'zod';

export const ProjectIdSchema = z.object({
  projectId: z.uuid(),
});

export * from './volunteerProject.schemas';
export * from './volunteerApplication.schemas';
export * from './partner.schemas';
