# Customer Support System - Setup Guide

## ✅ Implementation Complete

A complete customer support/contact form system has been implemented with email notifications.

---

## 📋 What Was Implemented

### Backend

1. **SupportMessage Model** (`src/models/SupportMessage.ts`)
   - Fields: name, email, subject, message, status (new/replied/closed)
   - Automatic timestamps (createdAt, updatedAt)

2. **Email Service** (`src/utils/emailService.ts`)
   - Uses Nodemailer with Gmail SMTP
   - Sends notification to `trackback.help@gmail.com`
   - Sets Reply-To as user's email for easy responses

3. **API Routes**
   - `POST /api/support` - Submit support message (public)
   - `GET /api/admin/support` - Get all messages (admin only)

### Frontend

1. **Customer Support Page** (`src/pages/CustomerSupport.tsx`)
   - Form now submits to backend API
   - Shows loading state and error messages
   - Success confirmation after submission

2. **Admin Dashboard - Messages Tab**
   - New "Messages" tab in sidebar
   - Lists all support messages
   - Click to view full message details
   - Shows status badges (new/replied/closed)

---

## 🔧 Email Configuration (REQUIRED)

To enable email notifications, you need to set up Gmail SMTP credentials.

### Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Go to **App passwords**: https://myaccount.google.com/apppasswords
4. Select **Mail** and **Other (Custom name)**
5. Enter "TrackBack Support" as the name
6. Click **Generate**
7. **Copy the 16-character password** (you'll need this)

### Step 2: Set Environment Variables

**For Local Development:**
Create or update `.env` file in `lost-and-found-lk-backend-node/`:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

**For Production (Render/Vercel):**
1. Go to your backend service dashboard (Render)
2. Navigate to **Environment** tab
3. Add these environment variables:
   - `SMTP_USER` = `your-email@gmail.com`
   - `SMTP_PASS` = `your-16-char-app-password`
4. Save and restart the service

### Step 3: Verify Email Works

1. Submit a test message from the Customer Support page
2. Check `trackback.help@gmail.com` inbox
3. You should receive an email notification

---

## 📧 Email Format

When a user submits a support message, the admin receives:

**Subject:** `New Support Message - [User's Subject]`

**Body includes:**
- User's name
- User's email (clickable)
- Subject
- Full message
- Reply-To is set to user's email (you can reply directly)

---

## 🔒 Security Notes

- ✅ Email credentials are stored in environment variables (never in code)
- ✅ Support message endpoint is public (no auth required)
- ✅ Admin messages endpoint requires admin authentication
- ✅ All inputs are validated and sanitized
- ✅ Email failures don't break the API (message is still saved)

---

## 🧪 Testing

### Test Support Form:
1. Go to `/support` page
2. Fill out the form
3. Submit
4. Check:
   - Success message appears
   - Message is saved in database
   - Email notification is sent (if SMTP configured)

### Test Admin Messages Tab:
1. Login to admin dashboard
2. Click "Messages" tab
3. View list of messages
4. Click a message to see full details

---

## 📝 API Endpoints

### POST /api/support
**Public endpoint** - No authentication required

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Need help",
  "message": "I need assistance with..."
}
```

**Response (Success):**
```json
{
  "message": "Support message submitted successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

**Response (Error):**
```json
{
  "message": "All fields are required: name, email, subject, message"
}
```

### GET /api/admin/support
**Admin only** - Requires Bearer token

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Need help",
    "message": "I need assistance with...",
    "status": "new",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
]
```

---

## 🐛 Troubleshooting

### Email Not Sending

1. **Check environment variables:**
   ```bash
   # In backend directory
   echo $SMTP_USER
   echo $SMTP_PASS
   ```

2. **Verify Gmail App Password:**
   - Make sure you're using App Password, not regular password
   - App Password should be 16 characters

3. **Check logs:**
   - Look for email-related errors in backend logs
   - Check if "Email notification skipped" appears (means SMTP not configured)

4. **Test SMTP connection:**
   - The email service will log errors if connection fails
   - Check backend console for detailed error messages

### Messages Not Appearing in Admin Dashboard

1. **Check authentication:**
   - Make sure you're logged in as admin
   - Check if token is valid

2. **Check API response:**
   - Open browser DevTools → Network tab
   - Check `/api/admin/support` request
   - Verify response status and data

3. **Check database:**
   - Verify messages are being saved
   - Check MongoDB collection `supportmessages`

---

## 📦 Dependencies Added

**Backend:**
- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types

**No new frontend dependencies** - Uses existing fetch API

---

## ✅ Summary

- ✅ Support form is fully functional
- ✅ Messages saved to MongoDB
- ✅ Email notifications to admin
- ✅ Admin dashboard Messages tab
- ✅ Mobile-friendly UI
- ✅ Error handling and validation

**Next Steps:**
1. Set up Gmail SMTP credentials (see Step 2 above)
2. Test the system end-to-end
3. Monitor email delivery

---

**Note:** If email is not configured, the system will still work - messages will be saved but no email notifications will be sent. Check backend logs for "Email notification skipped" message.

