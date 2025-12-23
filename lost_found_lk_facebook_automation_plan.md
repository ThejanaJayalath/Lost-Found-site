## Lost & Found LK – Automated Facebook Posting Plan

### Final Goal
Build an automated system where every approved Lost/Found report is converted into a Facebook Page post without manual work.

---

## System Overview
The application acts as a middleman between users and Facebook.

Flow:
1. User submits Lost/Found report
2. Backend saves data to MongoDB
3. Report marked as PENDING
4. Admin approves report
5. Backend auto-generates Facebook post
6. Post is published to Facebook Page

---

## Phase 0 – Preparation

### 0.1 Create Facebook Page
- Page name: Lost & Found LK
- Category: Community / Public Service

### 0.2 Meta Developer Account
- Create account at Meta for Developers
- Use the same Facebook account that owns the Page

---

## Phase 1 – Meta App Setup

### 1.1 Create Meta App
- App Type: Business
- App Name: LostAndFoundLK Automation

### 1.2 Add Facebook Login Product
- Platform: Web
- Redirect URL can be temporary during setup

### 1.3 Request Permissions
Required permissions:
- pages_manage_posts
- pages_read_engagement
- pages_manage_metadata

These permissions require App Review approval.

### 1.4 Generate Page Access Token
- Connect Facebook Page to App
- Generate Page Access Token
- Store securely in backend environment variables

---

## Phase 2 – Backend Design

### 2.1 Posting Strategy
Recommended safe flow:
- User submits report
- Save report
- Mark as PENDING
- Admin approval required
- Auto-post after approval

### 2.2 Database Fields
Add to report schema:
- facebookStatus: PENDING | POSTED | FAILED
- facebookPostId: string | null

---

## Phase 3 – Post Content Generation

### LOST ITEM TEMPLATE
🔴 LOST ITEM ALERT

📦 Item: {{title}}
📍 Location: {{location}}
📅 Date: {{date}}

📝 Description:
{{description}}

If found, please contact via Lost & Found LK.
🔗 {{publicReportUrl}}

#LostAndFoundLK #SriLanka

### FOUND ITEM TEMPLATE
🟢 FOUND ITEM NOTICE

📦 Item: {{title}}
📍 Found at: {{location}}
📅 Date: {{date}}

📝 Details:
{{description}}

Claim here:
🔗 {{publicReportUrl}}

#FoundItem #LostAndFoundLK

---

## Phase 4 – Image Handling

### Recommended Approach
- Upload images to Firebase Storage or Cloudinary
- Store public image URL in database
- Pass image URL to Facebook API

---

## Phase 5 – Facebook Posting Logic

### Trigger
- Admin clicks Approve

### API Endpoint Used
POST https://graph.facebook.com/{PAGE_ID}/photos

Payload:
- url: image URL
- caption: generated post text
- access_token: page token

### Error Handling
- If Facebook fails → report still saved
- If image invalid → mark FAILED
- If success → save facebookPostId

---

## Phase 6 – Admin Dashboard (Optional but Recommended)

Features:
- View pending reports
- Approve / Reject reports
- Retry failed Facebook posts
- View Facebook Post IDs

---

## Phase 7 – Testing

- Test with private Facebook Page
- Test large images, missing images
- Test Sinhala and English text
- Test emojis and long descriptions

---

## Phase 8 – Production Checklist

- Meta App approved
- Tokens stored securely
- Admin approval enabled
- Rate limits respected
- Privacy Policy & Terms updated

---

## Phase 9 – TikTok (Future Extension)

- TikTok requires video-based content
- Convert images to slideshow videos
- Use ffmpeg or similar tools
- Implement only after Facebook automation is stable

---

## Cost Summary
- Facebook Page: Free
- Meta App: Free
- API Posting: Free
- Rate limits: High enough for Lost & Found use

---

## Final Note
This automation increases visibility, speeds up item recovery, and differentiates Lost & Found LK from basic platforms.

