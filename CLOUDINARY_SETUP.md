# Cloudinary Setup Guide

## ✅ Code Changes Complete

The codebase has been updated to use Cloudinary instead of Firebase Storage for image uploads.

## 🚀 Setup Steps

### 1. Create Cloudinary Account (Free)

1. Go to https://cloudinary.com/users/register/free
2. Sign up with your email (completely free)
3. Verify your email address

### 2. Get Your Cloud Name

1. After signing up, you'll be taken to the Dashboard
2. Your **Cloud Name** is displayed at the top (e.g., `dxy123abc`)
3. Copy this value - you'll need it for environment variables

### 3. Create an Unsigned Upload Preset

1. In Cloudinary Dashboard, go to **Settings** (gear icon) → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `lost-found-lk` (or any name you prefer)
   - **Signing mode**: Select **Unsigned** (allows frontend uploads without API secret)
   - **Folder**: `lost-found-lk/posts` (optional, for organization)
   - **Tags**: `lost-found-lk` (optional)
   - **Access mode**: Public (default)
5. Click **Save**

### 4. Set Environment Variables

#### For Local Development

Create/update `.env` file in `lost-and-found-lk-frontend/`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=lost-found-lk
```

**Example:**
```env
VITE_CLOUDINARY_CLOUD_NAME=dxy123abc
VITE_CLOUDINARY_UPLOAD_PRESET=lost-found-lk
```

#### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   - `VITE_CLOUDINARY_CLOUD_NAME` = your cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET` = your preset name
4. Redeploy your application

## 🎯 What Changed

- ✅ `imageUpload.ts` - Now uses Cloudinary API
- ✅ `ReportLostModal.tsx` - Uploads to Cloudinary
- ✅ `ReportFoundModal.tsx` - Uploads to Cloudinary
- ✅ `firebase.ts` - Removed Firebase Storage (still using Firebase Auth)

## 📊 Cloudinary Free Tier Benefits

- **25 GB storage** (vs Firebase's 5 GB)
- **25 GB bandwidth/month** 
- Image transformations (resize, optimize, etc.) - included
- CDN delivery - fast image loading globally
- **No credit card required**

## 🧪 Testing

1. Start your dev server: `npm run dev`
2. Create a new Lost/Found post with images
3. Check browser console for any errors
4. Verify images appear correctly
5. Check MongoDB - images should be HTTPS URLs from `res.cloudinary.com`
6. Test Facebook posting - images should now appear! ✅

## ❓ Troubleshooting

### "Cloudinary credentials not configured"
- Make sure `.env` file exists with correct variable names
- Restart dev server after adding environment variables
- Check variable names match exactly (case-sensitive)

### Images not uploading
- Verify your upload preset is set to **Unsigned**
- Check Cloudinary Dashboard → Media Library to see if uploads are working
- Check browser console for specific error messages

### Images don't show in Facebook posts
- Verify image URLs in MongoDB start with `https://res.cloudinary.com/`
- Check that Facebook Graph API has access to fetch from Cloudinary (should work by default)
- Test the image URL directly in browser - should load the image

## 🔄 Migration from Firebase Storage

If you have existing posts with Firebase Storage URLs:
- Those will continue to work (no migration needed)
- New posts will use Cloudinary
- Old and new URLs both work with Facebook

## 📝 Next Steps

1. ✅ Set up Cloudinary account
2. ✅ Create upload preset
3. ✅ Add environment variables
4. ✅ Test image uploads
5. ✅ Test Facebook posting with images

---

**Need help?** Check Cloudinary docs: https://cloudinary.com/documentation/upload_images


