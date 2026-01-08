import { z } from 'zod';

export const PartnerFeedbackSchema = z.object({
  feedbackType: z.enum(['supervisor', 'peer', 'self']),
  reviewer: z.string().min(1),
  reviewee: z.string().min(1),
  score: z
    .number()
    .min(0)
    .max(100)
    .int(),
  strengths: z.string().optional().nullable(),
  improvements: z.string().optional().nullable(),
  projectId: z.uuid(),
});

export type PartnerFeedbackInput = z.infer<
    typeof PartnerFeedbackSchema
>;
