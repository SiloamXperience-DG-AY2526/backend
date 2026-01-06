import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Validate SMTP configuration at startup
export const validateSmtpConfig = async (): Promise<void> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) {
      throw new Error('SMTP credentials (SMTP_USER, SMTP_PASS, and SMTP_FROM) must be configured in environment variables');
    }
    
    // Verify transporter connection
    await transporter.verify();
    console.log('✅ SMTP configuration is valid and ready to send emails');
  } catch (error) {
    console.error('❌ SMTP configuration error:', error);
    throw new Error(`Failed to validate SMTP configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const sendVolunteerApplicationEmail = async ({
  to,
  name,
  projectTitle,
  positionTitle,
  startDate,
}: {
  to: string;
  name: string;
  projectTitle: string;
  positionTitle: string;
  startDate: Date;
}): Promise<void> => {
  try {
    const formattedDate = `${startDate.getDate().toString().padStart(2, '0')} ${startDate.toLocaleString('en-US', { month: 'short' })} ${startDate.getFullYear()} (${startDate.toLocaleDateString('en-US', { weekday: 'long' })})`;

    await transporter.sendMail({
      from: `"Volunteer Team" <${process.env.SMTP_FROM}>`,
      to,
      subject: 'Thank you for submitting your volunteer application',
      html: `
      <p>Hi ${name || 'Volunteer'},</p>

      <p>Thank you for applying to volunteer with us.</p>

      <p>
        <strong>Project:</strong> ${projectTitle}<br/>
        <strong>Position:</strong> ${positionTitle}<br/>
        <strong>Start Date:</strong> ${formattedDate}
      </p>

      <p>Your application has been received and is currently under review.</p>

      <p>Regards,<br/>
      Volunteer Management Team</p>
    `,
    });
    
    console.log(`✅ Volunteer application email sent successfully to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send volunteer application email:', error);
    throw new Error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

