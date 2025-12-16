# Fix: API Calls Going to Wrong Backend

## Problem
Your frontend is calling `lost-found-site-68tp…cel.app/api/posts` instead of your Render backend, causing 500 errors.

## Solution: Set Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Log in and select your project (`lost-found-site`)

### Step 2: Add Environment Variable
1. Click on **Settings** (top menu)
2. Click on **Environment Variables** (left sidebar)
3. Click **Add New**
4. Enter:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://lost-found-site.onrender.com/api`
   - **Environment:** Select all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Wait for deployment to complete (2-3 minutes)

## Verify It's Working

After redeployment:
1. Open your Vercel site
2. Open browser console (F12)
3. Look for these logs:
   - `API Base URL configured: https://lost-found-site.onrender.com/api`
   - `Using VITE_API_URL from environment: https://lost-found-site.onrender.com/api`

If you see warnings about fallback URL, the environment variable isn't set correctly.

## Alternative: Quick Test

You can test if the backend is working by visiting:
- `https://lost-found-site.onrender.com/api/posts?status=LOST`

If this returns JSON data, your backend is working and the issue is just the frontend configuration.

## Why This Happens

Vite environment variables (those starting with `VITE_`) are replaced at **build time**, not runtime. This means:
- If `VITE_API_URL` isn't set when Vercel builds your app, it won't be available
- You must set it in Vercel's environment variables **before** building
- After setting it, you must **redeploy** for it to take effect

The code has a fallback URL, but if the build was done before the fallback was added, it might not work until you redeploy.

