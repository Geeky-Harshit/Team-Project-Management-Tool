import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface InviteEmailParams {
  to: string;
  orgName: string;
  role: string;
  joinUrl: string;
  inviterName: string;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendInviteEmail({
  to,
  orgName,
  role,
  joinUrl,
  inviterName,
}: InviteEmailParams) {
  const safeInviter = escapeHtml(inviterName);
  const safeOrgName = escapeHtml(orgName);
  const safeRole = escapeHtml(role);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1a1a1a; margin-bottom: 8px;">You're Invited!</h2>
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        <strong>${safeInviter}</strong> has invited you to join
        <strong>${safeOrgName}</strong> as a <strong>${safeRole}</strong>.
      </p>
      <a href="${joinUrl}"
         style="display: inline-block; background: #f97316; color: white; text-decoration: none;
                padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px;">
        Accept &amp; Join
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        This invitation expires in 24 hours. If you didn't expect this, you can safely ignore it.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `You're invited to join ${safeOrgName} on TMT`,
    html,
  });
}
