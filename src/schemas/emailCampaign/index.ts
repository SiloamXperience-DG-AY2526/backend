import { z } from 'zod';
import { preprocessDate } from '../helper';

export const createEmailCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  senderAddress: z.email(),
});

export type CreateEmailCampaignInput = z.infer<
  typeof createEmailCampaignSchema
>;

export const updateAudienceSchema = z.object({
  projectId: z.uuid().optional(),
  isActivePartner: z.boolean().optional(),
  gender: z.enum(['male', 'female', 'others']),
  nationality: z.string().optional(),

  minAge: z.number().int().positive().optional(),
  maxAge: z.number().int().positive().optional(),

  volunteerInterests: z
    .array(
      z.enum([
        'fundraise',
        'planTrips',
        'missionTrips',
        'longTerm',
        'admin',
        'publicity',
        'teaching',
        'training',
        'agriculture',
        'building',
        'others',
      ])
    )
    .optional(),
  volunteerSkills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type UpdateAudienceInput = z.infer<
  typeof updateAudienceSchema
>;

export const updateDeliverySchema = z.object({
  scheduledAt: z.date(),
});

export const updateContentSchema = z.object({
  subject: z.string().min(1),
  previewText: z.string().optional(),
  body: z.string().min(1),
});

export const sendTestEmailSchema = z.object({
  email: z.email(),
});

export const EmailCampaignIdSchema = z.object({
  campaignId: z.uuid(),
});


