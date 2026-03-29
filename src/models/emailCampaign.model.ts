import { prisma } from '../prisma/client';
import { Prisma } from '@prisma/client';
import { Pagination } from './types';
import 'dotenv/config';
import type { createEmailCampaignData } from '../types/emailCampaign';
import { BadRequestError } from '../utils/errors';

export function createCampaignDB(userId: string, data: any) {
  return prisma.emailCampaign.create({
    data: {
      name: data.name,
      senderAddress: data.senderAddress,
      createdBy: userId,
    },
  });
}

async function ensureEditable(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    select: { status: true },
  });
  if (!campaign) throw new BadRequestError('Campaign not found');
  if (campaign.status === 'sent' || campaign.status === 'cancelled') {
    throw new BadRequestError('Sent or cancelled campaigns cannot be edited');
  }
}

export async function updateAudienceDB(campaignId: string, data: any) {
  await ensureEditable(campaignId);
  return prisma.emailAudienceFilter.upsert({
    where: { campaignId },
    update: data,
    create: { campaignId, ...data },
  });
}

export async function updateContentDB(campaignId: string, data: any) {
  await ensureEditable(campaignId);
  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data,
  });
}

export async function updateCampaignSchedule(campaignId: string, scheduledAt: Date | undefined) {
  await ensureEditable(campaignId);
  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { scheduledAt },
  });
}

export function markCampaignScheduled(campaignId: string) {
  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: 'scheduled' },
  });
}

export function markCampaignSent(campaignId: string) {
  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: 'sent' },
  });
}

export function getAudienceFilter(campaignId: string) {
  return prisma.emailAudienceFilter.findUnique({ where: { campaignId } });
}

export function findPartnersFromFilter(filter: any) {
  const where: any = {};

  if (filter.isActivePartner !== undefined && filter.isActivePartner !== null) {
    where.user = {
      is: {
        isActive: filter.isActivePartner,
      },
    };
  }

  if (filter.gender) {
    where.gender = filter.gender;
  }

  if (filter.nationality) {
    where.nationality = filter.nationality;
  }

  if (filter.minAge || filter.maxAge) {
    const today = new Date();
    where.dob = {};

    if (filter.minAge) {
      where.dob.lte = new Date(
        today.getFullYear() - filter.minAge,
        today.getMonth(),
        today.getDate()
      );
    }

    if (filter.maxAge) {
      where.dob.gte = new Date(
        today.getFullYear() - filter.maxAge,
        today.getMonth(),
        today.getDate()
      );
    }
  }

  if (filter.volunteerInterests?.length) {
    where.interests = {
      some: {
        interestSlug: { in: filter.volunteerInterests },
      },
    };
  }

  if (filter.volunteerSkills?.length) {
    where.skills = {
      some: {
        skill: { in: filter.volunteerSkills },
      },
    };
  }

  if (filter.languages?.length) {
    where.languages = {
      some: {
        language: { in: filter.languages },
      },
    };
  }

  return prisma.partner.findMany({
    where,
    select: {
      id: true,
      user: {},
    },
  });
}


export function countPartnersFromFilter(filter: any) {
  return prisma.partner.count({ where: filter });
}

export async function createTestEmail(campaignId: string, email: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error('Email campaign not found');
  }

  return prisma.email.create({
    data: {
      campaignId,
      senderAddress: `${process.env.SMTP_FROM}`,
      subject: campaign.subject || 'Test Email',
      body: campaign.body || 'Test',
      status: 'scheduled',
      isTest: true,
      recipients: {
        create: {
          recipientAddress: email,
          type: 'to',
          status: 'sent',
        },
      },
    },
  });
}

export function createEmailForCampaign(data: createEmailCampaignData) {
  return prisma.email.create({
    data: {
      campaignId: data.campaignId,
      senderAddress: data.senderAddress,
      subject: data.subject || '',
      previewText: data.previewText,
      body: data.body || '',
      status: data.status,
      scheduledAt: data.scheduledAt,
      recipients: {
        create: data.recipients.map((r) => ({
          recipientAddress: r.emailAddress,
          type: 'to',
          status: data.scheduledAt ? 'scheduled' : 'pending',
        })),
      },
    },
    include: { recipients: true },
  });
}

export function listScheduledCampaigns() {
  return prisma.emailCampaign.findMany({
    where: { status: 'scheduled' },
  });
}

export function listCampaigns(
  where: Prisma.EmailCampaignWhereInput,
  pagination: Pagination
) {
  return prisma.emailCampaign.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: pagination.skip,
    take: pagination.limit,
  });
}

export function countCampaigns(where: Prisma.EmailCampaignWhereInput) {
  return prisma.emailCampaign.count({ where });
}

export function getCampaignDetails(campaignId: string) {
  return prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      audienceFilter: true,
    },
  });
}

export async function deleteCampaignDB(campaignId: string) {
  await prisma.emailAudienceFilter.deleteMany({
    where: { campaignId },
  });

  return prisma.emailCampaign.delete({
    where: { id: campaignId },
  });
}

//financial manager review
type TemplateType = 'thankyou' | 'receipt';

function getEmailTemplateName(projectId: string, type: TemplateType) {
  return `donationReviewEmail:${type}:${projectId}`;
}

export async function saveEmailTemplate(
  projectId: string,
  type: TemplateType,
  userId: string,
  data: {
    senderAddress: string;
    subject: string;
    body: string;
    customNote?: string | null;
  }
) {
  const name = getEmailTemplateName(projectId, type);

  const existing = await prisma.emailCampaign.findFirst({
    where: { name },
  });

  if (existing) {
    return prisma.emailCampaign.update({
      where: { id: existing.id },
      data: {
        senderAddress: data.senderAddress,
        subject: data.subject,
        body: data.body,
        previewText: data.customNote ?? null,
      },
    });
  }

  return prisma.emailCampaign.create({
    data: {
      name,
      senderAddress: data.senderAddress,
      subject: data.subject,
      body: data.body,
      previewText: data.customNote ?? null,
      createdBy: userId,
    },
  });
}

export function getTemplate(projectId: string, type: TemplateType) {
  const name = getEmailTemplateName(projectId, type);
  return prisma.emailCampaign.findFirst({
    where: { name },
  });
}

export function getDonationTransaction(transactionId: string) {
  return prisma.donationTransaction.findUnique({
    where: { id: transactionId },
    include: {
      donor: true,
      project: true,
    },
  });
}

export function updateReceipt(
  transactionId: string,
  receiptData: any
) {
  return prisma.donationTransaction.update({
    where: { id: transactionId },
    data: {
      receiptStatus: 'received',
      receipt: JSON.stringify(receiptData),
    },
  });
}

export function markThankYouSent(transactionId: string) {
  return prisma.donationTransaction.update({
    where: { id: transactionId },
    data: { isThankYouSent: true },
  });
}
