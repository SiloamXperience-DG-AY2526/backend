import * as model from '../models/emailCampaign.model';
import { sendEmail } from '../utils/email';
import { BadRequestError } from '../utils/errors';

export async function createCampaign(userId: string, data: any) {
  return model.createCampaignDB(userId, data);
}

export async function updateAudience(campaignId: string, data: any) {
  return model.updateAudienceDB(campaignId, data);
}

export async function updateContent(campaignId: string, data: any) {
  return model.updateContentDB(campaignId, data);
}

export async function updateDelivery(campaignId: string, scheduledAt: Date) {
  return model.updateCampaignSchedule(campaignId, scheduledAt);
}

export async function previewAudience(campaignId: string) {
  const filter = await model.getAudienceFilter(campaignId);
  if (!filter) {
    return { count: 0, emails: [] };
  }

  const partners = await model.findPartnersFromFilter(filter);

  return {
    count: partners.length,
    emails: partners.map(p => p.user.email),
  };
}

export async function sendTestEmail(campaignId: string, email: string) {
  const emailRecord = await model.createTestEmail(campaignId, email);

  await sendEmail({
    to: email,
    subject: emailRecord.subject,
    html: emailRecord.body,
  });

  return emailRecord;
}

export async function publishCampaign(campaignId: string) {
  const campaign = await model.markCampaignScheduled(campaignId);
  if (!campaign) throw new BadRequestError("Email campaign not found");

  const partners = await model.findPartnersFromFilter(campaignId);
  if (partners.length === 0) throw new BadRequestError("No recipients found for this campaign");

  const recipients = partners
    .map((p) => {
      const emailAddress = p.user.email;
      if (!emailAddress) return null;
      return {
        partnerId: p.id,
        emailAddress,
      };
    })
    .filter(Boolean) as { partnerId: string; emailAddress: string }[];

  const emailRecord = await model.createEmailForCampaign({
    campaignId,
    senderAddress: campaign.senderAddress,
    subject: campaign.subject || "",
    previewText: campaign.previewText,
    body: campaign.body || "",
    status: "scheduled",
    scheduledAt: campaign.scheduledAt,
    recipients,
  });

  // send email to each recipient
  await Promise.all(
    recipients.map((r) =>
      sendEmail({
        to: r.emailAddress,
        subject: emailRecord.subject,
        html: emailRecord.body,
        from: campaign.senderAddress,
      })
    )
  );

  return { campaign, emai: emailRecord };
}

export async function getScheduledCampaigns() {
  return model.listScheduledCampaigns();
}

export async function deleteCampaign(campaignId: string) {
  return model.deleteCampaignDB(campaignId);
}
