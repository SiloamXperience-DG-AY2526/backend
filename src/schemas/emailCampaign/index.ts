import { z } from 'zod';
import { preprocessDate, PageType, LimitType } from '../helper';

export const createEmailCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  senderAddress: z.email(),
});

export type CreateEmailCampaignInput = z.infer<
  typeof createEmailCampaignSchema
>;

export const updateAudienceSchema = z.object({
  projectId: z.uuid().optional().nullable(),
  isActivePartner: z.boolean().optional().nullable(),
  gender: z.enum(['male', 'female', 'others']).optional().nullable(),
  nationality: z.string().optional().nullable(),

  minAge: z.number().int().positive().optional().nullable(),
  maxAge: z.number().int().positive().optional().nullable(),

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
    .optional()
    .nullable(),
  volunteerSkills: z.array(z.string()).optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
});

export type UpdateAudienceInput = z.infer<
  typeof updateAudienceSchema
>;

export const updateDeliverySchema = z.object({
  scheduledAt: preprocessDate,
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

export const EmailCampaignListQuerySchema = z.object({
  page: PageType,
  limit: LimitType,
  status: z.enum(['draft', 'scheduled', 'cancelled']).optional(),
});

export type EmailCampaignListQueryType = z.infer<
  typeof EmailCampaignListQuerySchema
>;
