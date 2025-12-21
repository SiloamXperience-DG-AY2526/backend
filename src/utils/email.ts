import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
}) => {

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
        <strong>Start Date:</strong>  ${formattedDate}
      </p>

      <p>Your application has been received and is currently under review.</p>

      <p>Regards,<br/>
      Volunteer Management Team</p>
    `,
  });
};

