import nodemailer from "nodemailer";
import { env } from "../config/env";

// Create reusable transporter
const createTransporter = () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn(
      "⚠️  SMTP credentials not configured. Email notifications will be disabled."
    );
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

export interface SupportMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Send email notification to admin about new support message
 */
export async function sendSupportNotification(
  messageData: SupportMessageData
): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("📧 Email notification skipped (SMTP not configured)");
    return;
  }

  const adminEmail = "trackback.help@gmail.com";

  const mailOptions = {
    from: `"TrackBack Support" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    replyTo: messageData.email, // Set Reply-To as user's email
    subject: "New Support Message - " + messageData.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #06B6D4;">New Support Message</h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${messageData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${messageData.email}">${messageData.email}</a></p>
          <p><strong>Subject:</strong> ${messageData.subject}</p>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h3 style="color: #333;">Message:</h3>
          <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${messageData.message}</p>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
          <p>This is an automated notification from TrackBack Support System.</p>
          <p>You can reply directly to this email to respond to ${messageData.name}.</p>
        </div>
      </div>
    `,
    text: `
New Support Message

Name: ${messageData.name}
Email: ${messageData.email}
Subject: ${messageData.subject}

Message:
${messageData.message}

---
This is an automated notification from TrackBack Support System.
You can reply directly to this email to respond to ${messageData.name}.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Support notification email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending support notification email:", error);
    // Don't throw - we don't want email failures to break the API
    throw error;
  }
}

