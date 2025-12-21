import { z } from 'zod';

export const projectIdSchema = z.object({
  projectId: z.uuid(),
});

export const idSchema = z.object({
  id: z.uuid(),
});
