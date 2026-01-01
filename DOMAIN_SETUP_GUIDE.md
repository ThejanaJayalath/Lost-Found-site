# Custom Domain Setup Guide: trackback.website

Complete guide to add `trackback.website` as your custom domain on Vercel.

---

## 📋 Prerequisites

1. ✅ **Domain Purchased**: You need to own `trackback.website` (or have access to its DNS settings)
2. ✅ **Vercel Project**: Your frontend must already be deployed on Vercel
3. ✅ **Domain Registrar Access**: Access to your domain registrar's DNS management panel

---

## 🚀 Step-by-Step Guide

### Step 1: Purchase Domain (If Not Done)

If you haven't purchased `trackback.website` yet:

1. Go to a domain registrar (Namecheap, GoDaddy, Google Domains, Cloudflare, etc.)
2. Search for `trackback.website`
3. Complete the purchase
4. **Note where you purchased it** - you'll need access to DNS settings

---

### Step 2: Add Domain to Vercel

1. **Login to Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Login with your account
   - Select your project (e.g., `lost-found-site`)

2. **Navigate to Domain Settings**
   - Click on **"Settings"** tab (top menu)
   - Click on **"Domains"** (left sidebar)
   - You'll see a list of your current domains (likely just the `.vercel.app` domain)

3. **Add Custom Domain**
   - Click **"Add"** or **"Add Domain"** button
   - Enter: `trackback.website`
   - Click **"Add"**

4. **Vercel Will Show DNS Instructions**
   - Vercel will display DNS configuration instructions
   - **IMPORTANT**: Note down the DNS records Vercel provides (usually a CNAME or A record)
   - Example: `CNAME cname.vercel-dns.com` or A records with IP addresses

---

### Step 3: Configure DNS at Your Domain Registrar

Now you need to add DNS records at your domain registrar:

1. **Login to Your Domain Registrar**
   - Go to your domain registrar's website
   - Login to your account
   - Navigate to DNS Management / DNS Settings

2. **Find DNS Management Section**
   - Look for "DNS Settings", "DNS Management", "Nameservers", or "DNS Records"
   - Each registrar has different names, but it's usually in "Domain Settings" or "Advanced Settings"

3. **Add DNS Records (Choose ONE method)**

   **Method A: CNAME Record (Recommended - Easiest)**
   - If Vercel shows a CNAME record:
     - **Type**: CNAME
     - **Host/Name**: `@` or `trackback.website` or leave blank (depends on registrar)
     - **Value/Target**: `cname.vercel-dns.com` (or what Vercel specifies)
     - **TTL**: 3600 (or Auto/Default)

   **Method B: A Records (Alternative)**
   - If Vercel shows A records:
     - **Type**: A
     - **Host/Name**: `@` or `trackback.website` or leave blank
     - **Value/Target**: IP addresses provided by Vercel (usually 3-4 IPs)
     - **TTL**: 3600 (or Auto/Default)
     - Add all IPs provided by Vercel as separate A records

4. **Save DNS Records**
   - Click "Save" or "Add Record"
   - Wait for DNS propagation (can take 5 minutes to 48 hours, usually 15-60 minutes)

---

### Step 4: Verify Domain in Vercel

1. **Go Back to Vercel Dashboard**
   - Return to Vercel → Your Project → Settings → Domains
   - You should see `trackback.website` with a status indicator

2. **Wait for Domain Verification**
   - Status will show "Validating..." or "Pending"
   - Vercel automatically checks DNS records
   - Once verified, status changes to "Valid" ✅
   - **SSL certificate is automatically issued** by Vercel (free, automatic)

3. **If Verification Fails**
   - Check that DNS records are saved correctly
   - Wait a bit longer (DNS propagation can be slow)
   - Verify you entered the exact values Vercel provided

---

### Step 5: Update Backend CORS Configuration

⚠️ **IMPORTANT**: After your domain is working, update your backend to allow requests from the new domain.

**Option A: Update Environment Variable (Recommended)**

1. **Go to Render Dashboard** (or wherever your backend is hosted)
2. Navigate to your backend service
3. Go to **"Environment"** tab
4. Find `APP_CORS_ALLOWEDORIGINS` environment variable
5. **Update or Add** the value to include your new domain:
   ```
   http://localhost:5173,https://lost-found-site.vercel.app,https://trackback.website
   ```
   (Add `https://trackback.website` to the existing list, comma-separated)
6. Click **"Save Changes"**
7. Wait for backend to restart (2-3 minutes)

**Option B: Update Code (If Using Code-Based CORS)**

If your CORS is configured in code (like `env.ts`), you'll need to:
1. Update the default CORS origins in your backend code
2. Add `https://trackback.website` to the allowed origins list
3. Commit and push changes
4. Backend will auto-redeploy

**Current Backend CORS Config Location:**
- File: `lost-and-found-lk-backend-node/src/config/env.ts`
- Environment Variable: `APP_CORS_ALLOWEDORIGINS`

---

### Step 6: Test Your New Domain

1. **Wait for DNS Propagation** (15-60 minutes typically)
2. **Visit**: `https://trackback.website`
3. **Test the application**:
   - ✅ Website loads correctly
   - ✅ Login works
   - ✅ Creating posts works
   - ✅ No CORS errors in browser console (F12)
   - ✅ All API calls work

---

### Step 7: (Optional) Set as Primary Domain

If you want `trackback.website` to be your primary domain:

1. In Vercel → Settings → Domains
2. Find `trackback.website`
3. Click the three dots (⋯) menu
4. Select "Set as Primary Domain" (if available)
5. This makes it the default domain for your project

---

## 🔍 DNS Propagation Check

To check if your DNS records have propagated:

1. **Online DNS Checker**: Use [dnschecker.org](https://dnschecker.org)
   - Enter: `trackback.website`
   - Select record type: `CNAME` or `A`
   - Click "Search"
   - Should show Vercel's DNS values across multiple locations

2. **Command Line** (Windows PowerShell):
   ```powershell
   nslookup trackback.website
   ```

---

## 🐛 Troubleshooting

### Domain Not Verifying in Vercel

**Possible Causes:**
- DNS records not saved correctly
- Wrong DNS values entered
- DNS propagation still in progress (wait 1-24 hours)

**Solution:**
1. Double-check DNS records match exactly what Vercel provided
2. Use DNS checker to verify propagation
3. Wait longer (some DNS changes take 24-48 hours)

---

### Website Shows "Invalid Certificate" or "Not Secure"

**Cause:** SSL certificate not yet issued

**Solution:**
- Vercel automatically issues SSL certificates, but it takes 5-10 minutes after domain verification
- Wait a bit longer
- If still not working after 24 hours, contact Vercel support

---

### CORS Errors After Domain Change

**Cause:** Backend not updated with new domain

**Solution:**
- Update `APP_CORS_ALLOWEDORIGINS` environment variable in Render/backend host
- Add `https://trackback.website` to the allowed origins list
- Restart backend service

---

### Website Loads But Old Domain Still Works

**This is Normal!**
- Both domains will work (your old `.vercel.app` domain AND `trackback.website`)
- You can keep both, or remove the old one in Vercel settings
- Most users keep both as backup

---

## 📝 Summary Checklist

- [ ] Domain `trackback.website` purchased
- [ ] Domain added to Vercel project
- [ ] DNS records added at domain registrar
- [ ] DNS records match Vercel's instructions exactly
- [ ] Domain verified in Vercel (shows "Valid" ✅)
- [ ] SSL certificate issued (automatic, wait 5-10 min)
- [ ] Backend CORS updated with `https://trackback.website`
- [ ] Website tested and working on new domain
- [ ] No CORS errors in browser console

---

## 🔗 Important URLs After Setup

- **Frontend (New Domain)**: `https://trackback.website`
- **Frontend (Old Domain)**: `https://your-project.vercel.app` (still works)
- **Backend API**: `https://lost-found-site.onrender.com/api` (no change needed)

---

## 💡 Pro Tips

1. **Keep Both Domains**: Your old `.vercel.app` domain will continue working. You can use it as a backup.

2. **DNS Propagation Time**: 
   - Usually: 15-60 minutes
   - Sometimes: Up to 48 hours
   - Be patient!

3. **SSL Certificate**: Vercel provides free SSL certificates automatically. No additional setup needed.

4. **Subdomains**: If you want `www.trackback.website`, add it separately in Vercel (same process).

5. **Domain Redirects**: You can set up redirects in Vercel if you want `www.trackback.website` to redirect to `trackback.website`.

---

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- **Vercel Support**: Available in Vercel dashboard
- **DNS Issues**: Contact your domain registrar's support

---

**Good luck with your domain setup! 🚀**

