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

export interface FoundItemNotificationData {
  ownerEmail: string;
  ownerName: string;
  finderEmail: string;
  finderName?: string;
  postTitle: string;
  postDescription: string;
  postLocation: string;
  postDate: Date;
  contactPhone?: string;
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

/**
 * Send email notification to owner when someone reports finding their lost item
 */
export async function sendFoundItemNotification(
  notificationData: FoundItemNotificationData
): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("📧 Email notification skipped (SMTP not configured)");
    return;
  }

  const formattedDate = new Date(notificationData.postDate).toLocaleDateString();
  const finderDisplayName = notificationData.finderName || notificationData.finderEmail;

  const mailOptions = {
    from: `"TrackBack Lost & Found" <${process.env.SMTP_USER}>`,
    to: notificationData.ownerEmail,
    replyTo: notificationData.finderEmail, // Set Reply-To as finder's email
    subject: `🎉 Someone Found Your Lost Item: ${notificationData.postTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Great News!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Someone has reported finding your lost item</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">Item Details</h2>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong style="color: #666;">Title:</strong> <span style="color: #333;">${notificationData.postTitle}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #666;">Description:</strong> <span style="color: #333;">${notificationData.postDescription}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #666;">Location:</strong> <span style="color: #333;">${notificationData.postLocation}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #666;">Lost Date:</strong> <span style="color: #333;">${formattedDate}</span></p>
          </div>

          <h2 style="color: #333;">Finder Information</h2>
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong style="color: #065f46;">Name/Email:</strong> <span style="color: #047857;">${finderDisplayName}</span></p>
            <p style="margin: 8px 0;"><strong style="color: #065f46;">Contact Email:</strong> <a href="mailto:${notificationData.finderEmail}" style="color: #059669; text-decoration: none;">${notificationData.finderEmail}</a></p>
            ${notificationData.contactPhone ? `<p style="margin: 8px 0;"><strong style="color: #065f46;">Your Contact Phone:</strong> <span style="color: #047857;">${notificationData.contactPhone}</span></p>` : ''}
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              ⚠️ <strong>Important:</strong> Please contact the finder as soon as possible to verify and arrange pickup. 
              Always verify the item details before meeting.
            </p>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            You can reply directly to this email to contact the finder at <a href="mailto:${notificationData.finderEmail}" style="color: #059669;">${notificationData.finderEmail}</a>
          </p>
          <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
            This is an automated notification from TrackBack Lost & Found System.
          </p>
        </div>
      </div>
    `,
    text: `
🎉 Great News! Someone Found Your Lost Item

Item Details:
- Title: ${notificationData.postTitle}
- Description: ${notificationData.postDescription}
- Location: ${notificationData.postLocation}
- Lost Date: ${formattedDate}

Finder Information:
- Name/Email: ${finderDisplayName}
- Contact Email: ${notificationData.finderEmail}
${notificationData.contactPhone ? `- Your Contact Phone: ${notificationData.contactPhone}` : ''}

⚠️ Important: Please contact the finder as soon as possible to verify and arrange pickup. 
Always verify the item details before meeting.

You can reply directly to this email to contact the finder at ${notificationData.finderEmail}

---
This is an automated notification from TrackBack Lost & Found System.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Found item notification email sent to owner:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending found item notification email:", error);
    // Don't throw - we don't want email failures to break the API
    throw error;
  }
}

