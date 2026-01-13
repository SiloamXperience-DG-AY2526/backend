import { Gender, InterestSlug } from '@prisma/client';

export interface UpdateAudienceInput {
  projectId?: string;
  isActivePartner?: boolean;
  gender?: Gender;
  nationality?: string;
  minAge?: number;
  maxAge?: number;
  volunteerInterests?: InterestSlug[];
  volunteerSkills?: string[];
  languages?: string[];
}

export interface createEmailCampaignData {
  campaignId: string;
  senderAddress: string;
  subject?: string;
  previewText: string | null;
  body?: string;
  status: "scheduled" | "attempted" | "cancelled";
  scheduledAt: Date | null;
  recipients: { partnerId: string; emailAddress: string }[];
}