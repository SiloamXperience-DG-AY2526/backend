import { prisma } from '../prisma/client';
import 'dotenv/config';
import type { createEmailCampaignData } from '../types/emailCampaign';

export function createCampaignDB(userId: string, data: any) {
  return prisma.emailCampaign.create({
    data: {
      name: data.name,
      senderAddress: data.senderAddress,
      createdBy: userId,
    },
  });
}

export function updateAudienceDB(campaignId: string, data: any) {
  return prisma.emailAudienceFilter.upsert({
    where: { campaignId },
    update: data,
    create: { campaignId, ...data },
  });
}

export function updateContentDB(campaignId: string, data: any) {
  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data,
  });
}

export function updateCampaignSchedule(campaignId: string, scheduledAt: Date | undefined) {
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

export function getAudienceFilter(campaignId: string) {
  return prisma.emailAudienceFilter.findUnique({ where: { campaignId } });
}

export function findPartnersFromFilter(filter: any) {
  const where: any = {};

  if (filter.isActivePartner !== undefined) {
    where.user = {
      isActive: filter.isActivePartner,
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

export async function deleteCampaignDB(campaignId: string) {
  await prisma.emailAudienceFilter.deleteMany({
    where: { campaignId },
  });

  return prisma.emailCampaign.delete({
    where: { id: campaignId },
  });
}
