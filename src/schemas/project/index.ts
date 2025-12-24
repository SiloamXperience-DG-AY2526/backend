import { z } from 'zod';

export const ProjectIdSchema = z.object({
  projectId: z.uuid(),
});

export const IdSchema = z.object({
  id: z.uuid(),
});
