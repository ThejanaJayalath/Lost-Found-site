# MongoDB Connection Fix for Render Deployment

## 🔴 Problem
Your backend on Render is getting SSL/TLS errors when trying to connect to MongoDB Atlas:
```
javax.net.ssl.SSLException: Received fatal alert: internal_error
com.mongodb.MongoSocketWriteException: Exception sending message
```

## ✅ Solution

### Step 1: Whitelist Render IPs in MongoDB Atlas

**This is the most common cause of MongoDB connection failures on Render.**

1. **Go to MongoDB Atlas Dashboard:**
   - Visit [cloud.mongodb.com](https://cloud.mongodb.com)
   - Log in to your account
   - Select your cluster

2. **Navigate to Network Access:**
   - Click **"Network Access"** in the left sidebar
   - Click **"Add IP Address"** button

3. **Add Render IPs:**
   - **Option A (Recommended for Development):** Add `0.0.0.0/0` to allow all IPs
     - Click **"Allow Access from Anywhere"** or manually enter `0.0.0.0/0`
     - Click **"Confirm"**
   
   - **Option B (More Secure):** Add specific Render IP ranges
     - Render uses dynamic IPs, so you may need to check Render's documentation for current IP ranges
     - For now, `0.0.0.0/0` is acceptable for development

4. **Wait 1-2 minutes** for the changes to propagate

### Step 2: Verify Environment Variables in Render

1. **Go to Render Dashboard:**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Select your backend service (`lost-found-site`)

2. **Check Environment Variables:**
   - Click on **"Environment"** tab
   - Verify these variables are set:
     ```
     SPRING_DATA_MONGODB_URI=mongodb+srv://todoListApp:sinhalanews@cluster0.gdcsnzk.mongodb.net/lost_and_found?retryWrites=true&w=majority&tls=true
     JWT_SECRET=5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437
     APP_CORS_ALLOWEDORIGINS=http://localhost:5173,https://lost-found-site.vercel.app
     SERVER_PORT=8082
     ```

3. **If variables are missing, add them:**
   - Click **"Add Environment Variable"**
   - Add each variable with its value
   - Click **"Save Changes"**
   - Render will automatically redeploy

### Step 3: Verify MongoDB Connection String

Your connection string should look like:
```
mongodb+srv://todoListApp:sinhalanews@cluster0.gdcsnzk.mongodb.net/lost_and_found?retryWrites=true&w=majority&tls=true
```

**Important Notes:**
- Make sure your MongoDB Atlas username and password are correct
- The `&tls=true` parameter is added to ensure TLS/SSL is enabled
- The database name (`lost_and_found`) should match your actual database

### Step 4: Test the Connection

1. **Check Render Logs:**
   - Go to your Render service
   - Click on **"Logs"** tab
   - Look for MongoDB connection messages
   - You should see successful connection messages, not SSL errors

2. **Test API Endpoint:**
   - Visit: `https://lost-found-site.onrender.com/api/posts`
   - Should return data (or empty array) instead of 500 error

## 🔍 Additional Troubleshooting

### If Still Not Working:

1. **Check MongoDB Atlas Cluster Status:**
   - Ensure your cluster is running (not paused)
   - Free tier clusters pause after inactivity

2. **Verify Database User:**
   - Go to MongoDB Atlas → **Database Access**
   - Ensure user `todoListApp` exists and has proper permissions
   - Password should match what's in your connection string

3. **Check Connection String Format:**
   - Connection strings are case-sensitive
   - Special characters in password need to be URL-encoded
   - Example: `@` becomes `%40`, `#` becomes `%23`

4. **Test Connection Locally:**
   - Try connecting from your local machine first
   - If it works locally but not on Render, it's definitely an IP whitelist issue

## 📝 Quick Checklist

- [ ] MongoDB Atlas Network Access includes `0.0.0.0/0` (or Render IPs)
- [ ] Environment variables are set in Render dashboard
- [ ] MongoDB connection string is correct in environment variables
- [ ] MongoDB cluster is running (not paused)
- [ ] Database user exists and has correct permissions
- [ ] Render service has been redeployed after changes

## 🎯 Expected Result

After completing these steps:
- ✅ No more SSL/TLS errors in Render logs
- ✅ API endpoints return 200 status codes
- ✅ Frontend can successfully fetch data from backend
- ✅ MongoDB connection established successfully

---

**Need Help?** If issues persist after following these steps, check:
1. Render service logs for specific error messages
2. MongoDB Atlas logs for connection attempts
3. Verify your MongoDB Atlas account is active and not suspended

