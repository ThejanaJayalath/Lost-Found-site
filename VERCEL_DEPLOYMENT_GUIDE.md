# Vercel Frontend Deployment Guide

Complete step-by-step guide to deploy your React/Vite frontend to Vercel.

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Your code pushed to GitHub
- ✅ Backend deployed on Render (https://lost-found-site.onrender.com)

---

## 🚀 Step-by-Step Deployment

### Step 1: Update Frontend API URL

Before deploying, update your frontend to use the production backend URL.

**Find your API configuration file** (usually `src/api/axios.ts` or similar):

```typescript
// Change from:
const BASE_URL = 'http://localhost:8082/api';

// To:
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';
```

This allows you to use environment variables for different environments.

---

### Step 2: Push Code to GitHub

```powershell
cd C:\Lost-Found-site
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

---

### Step 3: Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub repositories

---

### Step 4: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find your repository (e.g., `lost-and-found-app` or `Lost-Found-site`)
4. Click **"Import"** next to it

---

### Step 5: Configure Project Settings

**CRITICAL: Set the Root Directory!**

1. **Framework Preset:** Vite (should auto-detect)
2. **Root Directory:** Click **"Edit"** → Select `lost-and-found-lk-frontend`
3. **Build Command:** `npm run build` (auto-filled)
4. **Output Directory:** `dist` (auto-filled)
5. **Install Command:** `npm install` (auto-filled)

---

### Step 6: Add Environment Variables

Before deploying, add your backend URL:

1. Expand **"Environment Variables"** section
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://lost-found-site.onrender.com/api`
3. Click **"Add"**

---

### Step 7: Deploy!

1. Click **"Deploy"**
2. Wait 2-5 minutes while Vercel:
   - Installs dependencies
   - Builds your app
   - Deploys to their CDN
3. You'll see a success screen with your live URL!

---

### Step 8: Get Your Live URL

Your app will be live at:
- **Production:** `https://your-project-name.vercel.app`
- Example: `https://lost-and-found-frontend.vercel.app`

**Copy this URL!** You'll need it for the next step.

---

### Step 9: Update Backend CORS

Your backend needs to allow requests from your new Vercel URL.

**Go to Render Dashboard:**

1. Open your backend service
2. Go to **"Environment"**
3. Find `APP_CORS_ALLOWEDORIGINS` (or add it if missing)
4. **Update to:**
   ```
   https://your-project-name.vercel.app
   ```
5. Click **"Save Changes"**
6. Wait for Render to restart

**OR** update `application.properties` locally and push:

```properties
app.cors.allowedOrigins=https://your-project-name.vercel.app
```

Then commit and push to trigger a Render redeploy.

---

## ✅ Verify Everything Works

1. Visit your Vercel URL
2. Try logging in
3. Try creating/viewing posts
4. Check browser console for errors

---

## 🔄 Future Updates

Every time you push to GitHub `main` branch:
- Vercel **automatically rebuilds and redeploys** your frontend
- No manual steps needed!

---

## 🐛 Troubleshooting

### "CORS Error" in Browser Console

**Fix:** Make sure you updated the backend's `app.cors.allowedOrigins` to include your Vercel URL.

### "Network Error" / "Failed to Fetch"

**Fix:** Check that `VITE_API_URL` environment variable is set correctly in Vercel.

### Build Fails

**Fix:** Check the build logs in Vercel dashboard. Usually it's a missing dependency or TypeScript error.

---

## 📝 Summary

✅ Frontend Code Updated  
✅ Pushed to GitHub  
✅ Imported to Vercel  
✅ Root Directory Set: `lost-and-found-lk-frontend`  
✅ Environment Variable Added: `VITE_API_URL`  
✅ Deployed Successfully  
✅ Backend CORS Updated  

**Your full-stack app is now LIVE!** 🎉
