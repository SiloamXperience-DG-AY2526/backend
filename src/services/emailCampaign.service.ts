import * as model from '../models/emailCampaign.model';
import { sendEmail } from '../utils/email';
import { BadRequestError } from '../utils/errors';
import { buildPagination, calculateSkip } from './paginationHelper';
import { EmailCampaignListQueryType } from '../schemas/emailCampaign';

export async function createCampaign(userId: string, data: any) {
  return model.createCampaignDB(userId, data);
}

export async function updateAudience(campaignId: string, data: any) {
  return model.updateAudienceDB(campaignId, data);
}

export async function updateContent(campaignId: string, data: any) {
  return model.updateContentDB(campaignId, data);
}

export async function updateDelivery(campaignId: string, scheduledAt: Date | undefined) {
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

export async function getCampaigns(filters: EmailCampaignListQueryType) {
  const { page, limit, status } = filters;
  const skip = calculateSkip(page, limit);
  const where = status ? { status } : {};

  const [campaigns, totalCount] = await Promise.all([
    model.listCampaigns(where, { skip, limit }),
    model.countCampaigns(where),
  ]);

  return {
    campaigns,
    pagination: buildPagination(page, limit, totalCount),
  };
}

export async function getCampaignDetails(campaignId: string) {
  return model.getCampaignDetails(campaignId);
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
  if (!campaign) throw new BadRequestError('Email campaign not found');

  const filter = await model.getAudienceFilter(campaignId);
  const partners = await model.findPartnersFromFilter(filter);
  if (partners.length === 0) throw new BadRequestError('No recipients found for this campaign');

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
    subject: campaign.subject || '',
    previewText: campaign.previewText,
    body: campaign.body || '',
    status: 'scheduled',
    scheduledAt: campaign.scheduledAt,
    recipients,
  });

  // Only send emails immediately if no scheduled date or scheduled date is in the past
  // const now = new Date();
  // if (!campaign.scheduledAt || campaign.scheduledAt <= now) {
  //   await Promise.all(
  //     recipients.map((r) =>
  //       sendEmail({
  //         to: r.emailAddress,
  //         subject: emailRecord.subject,
  //         html: emailRecord.body,
  //         from: campaign.senderAddress,
  //       })
  //     )
  //   );
  // }

  // TODO: Currently send the email regardless of the schedule date.
  // Needs to implement the cron job for scheduled email
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

  const sentCampaign = await model.markCampaignSent(campaignId);

  return { campaign: sentCampaign, emai: emailRecord, partners };
}

export async function getScheduledCampaigns() {
  return model.listScheduledCampaigns();
}

export async function deleteCampaign(campaignId: string) {
  return model.deleteCampaignDB(campaignId);
}

//financial manager email review



function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return vars[key.trim()] ?? '';
  });
}

export async function donationReviewEmailSaveTemplate(
  userId: string,
  projectId: string,
  data: any
) {
  return model.saveEmailTemplate(projectId, data.type, userId, data);
}
function getDefaultTemplate(type: 'thankyou' | 'receipt' | 'followup') {
  if (type === 'receipt') {
    return {
      subject: 'Your receipt {{receiptNumber}} — {{project}}',
      body: `Hi {{name}},<br/>
Thank you for your donation to {{project}}.
Your donation was successful.<br/>
Receipt No: {{receiptNumber}}
Receipt Date: {{receiptDate}}
Amount: {{amount}}
Remarks: {{remarks}}<br/>
With gratitude,<br/>Finance Team`,
      senderAddress: '',
      previewText: '',
    };
  }
  if (type === 'followup') {
    return {
      subject: 'Reminder: Complete your donation for {{project}}',
      body: `Hi {{name}},<br/>
We noticed that your donation to {{project}} is still pending.<br/>
Amount: {{amount}}<br/><br/>
Please complete your payment at your earliest convenience.<br/>
If you have already made the payment, kindly ignore this message.<br/><br/>
Thank you for your support.<br/>
Finance Team`,
      senderAddress: '',
      previewText: '',
    };
  }
  return {
    subject: 'Thank you {{name}} — we’ve received your donation for {{project}}',
    body: `Hi {{name}},<br/>
Thank you for your donation to {{project}}.<br/>
Donation amount: {{amount}}<br/>
We’re currently processing your payment and will update you shortly.
Once confirmed, we’ll send your official receipt.<br/>
Warm regards,<br/>Finance Team`,
    senderAddress: '',
    previewText: '',
  };
}
export async function donationReviewEmailGetTemplate(
  projectId: string,
  type: 'thankyou' | 'receipt' | 'followup'
) {
  const tpl = await model.getTemplate(projectId, type);

  // if no saved template in DB -> return default
  if (!tpl) return getDefaultTemplate(type);

  
  return {
    subject: tpl.subject ?? getDefaultTemplate(type).subject,
    body: tpl.body ?? getDefaultTemplate(type).body,
    senderAddress: tpl.senderAddress ?? '',
    previewText: tpl.previewText ?? '',
  };
}

/**
 * Send Thank You (auto after donation)
 */
export async function donationReviewEmailSendThankYou(
  transactionId: string
) {
  const tx = await model.getDonationTransaction(transactionId);
  if (!tx) throw new BadRequestError('Transaction not found');

  if (tx.isThankYouSent) return;

  const tpl = await model.getTemplate(tx.projectId, 'thankyou');
  if (!tpl) {
    throw new BadRequestError('ThankYou template not configured');
  }

  const vars = {
    name: `${tx.donor.firstName} ${tx.donor.lastName}`,
    project: tx.project.title,
    amount: tx.amount.toString(),
  };

  const subject = renderTemplate(tpl.subject!, vars);
  const body = renderTemplate(tpl.body!, vars);

  await sendEmail({
    to: tx.donor.email,
    subject,
    html: body,
    from: tpl.senderAddress,
  });

  await model.markThankYouSent(transactionId);
}


// Follow up for payment
 
export async function donationReviewEmailFollowUp(
  transactionId: string
) {
  const tx = await model.getDonationTransaction(transactionId);
  if (!tx) throw new BadRequestError('Transaction not found');

  if (tx.receiptStatus !== 'pending') return;

  const tpl = await model.getTemplate(tx.projectId, 'followup');
  if (!tpl) {
    throw new BadRequestError('Follow-up template not configured');
  }

  const vars = {
    name: `${tx.donor.firstName} ${tx.donor.lastName}`,
    project: tx.project.title,
    amount: tx.amount.toString(),
  };

  const subject = renderTemplate(tpl.subject!, vars);
  const body = renderTemplate(tpl.body!, vars);

  await sendEmail({
    to: tx.donor.email,
    subject,
    html: body,
    from: tpl.senderAddress,
  });
}

// Process receipt + email receipt

export async function donationReviewEmailProcessReceipt(
  userId: string,
  transactionId: string,
  data: any
) {
  const tx = await model.getDonationTransaction(transactionId);
  if (!tx) throw new BadRequestError('Transaction not found');

  const tpl = await model.getTemplate(tx.projectId, 'receipt');
  if (!tpl) throw new BadRequestError('Receipt template not configured');

  const receiptData = {
    receiptNumber: data.receiptNumber,
    // scheduledAt: data.scheduledAt,
    remarks: data.remarks ?? null,
    processedBy: userId,
    processedAt: data.receiptDate ? new Date(data.receiptDate) : new Date(),
  };

  await model.updateReceipt(transactionId, receiptData);

  const vars = {
    name: `${tx.donor.firstName} ${tx.donor.lastName}`,
    project: tx.project.title,
    amount: tx.amount.toString(),
    receiptNumber: data.receiptNumber,
    remarks: data.remarks ?? '',
    receiptDate: data.receiptDate
      ? new Date(data.receiptDate).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };

  const subject = renderTemplate(tpl.subject!, vars);
  const body = renderTemplate(tpl.body!, vars);
  if (data.receiptDate && !tpl.body?.includes('{{receiptDate}}')) {
    console.warn(
      '[Email Template Warning] receiptDate provided but not used in template'
    );
  }
  await sendEmail({
    to: tx.donor.email,
    subject,
    html: body,
    from: tpl.senderAddress,
  });
}