# Full Stack Deployment Guide (Monorepo)
## Backend on Render + Frontend on Vercel

This guide explains how to deploy your project when both backend and frontend are in the **same GitHub repository**.

---

## 📂 Project Structure
Your repository looks like this:
```
my-repo/
├── lost-and-found-lk-backend/  (Spring Boot)
└── lost-and-found-lk-frontend/ (React + Vite)
```

---

## 🚀 Step 1: Push Everything to GitHub

1. Go to the **root folder** (`c:\Lost-Found-site`).
2. Run these commands to push the entire project as one repository:

```powershell
git init
git add .
git commit -m "Initial monorepo commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lost-and-found-app.git
git push -u origin main
```

---

## 🐘 Step 2: Deploy Backend to Render

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your **GitHub repository**.
4. **Configure Settings (Crucial!):**
   - **Name:** `lost-and-found-backend`
   - **Root Directory:** `lost-and-found-lk-backend`  ← **IMPORTANT**
   - **Runtime:** `Docker`
   - **Instance Type:** Free
5. **Environment Variables:**
   - `SPRING_DATA_MONGODB_URI`: (Your MongoDB Connection String)
   - `JWT_SECRET`: (Your Secret Key)
   - `SERVER_PORT`: `8082`
6. Click **Create Web Service**.

**✅ Copy your Backend URL:** (e.g., `https://lost-and-found-backend.onrender.com`)

---

## ▲ Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Import your **GitHub repository**.
4. **Configure Project (Crucial!):**
   - **Framework Preset:** Vite
   - **Root Directory:** Click "Edit" and select `lost-and-found-lk-frontend`.
5. **Build Settings:** (Should auto-detect, but verify)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **Deploy**.

**✅ Copy your Frontend URL:** (e.g., `https://lost-and-found-frontend.vercel.app`)

---

## 🔗 Step 4: Connect Them Together

Now that you have both URLs, you need to link them.

### 1. Update Frontend (Connect to Backend)
In your local code, open `src/api/axios.ts` (or your config file):

```typescript
// Update with your Render Backend URL
const BASE_URL = 'https://lost-and-found-backend.onrender.com/api'; 
```

### 2. Update Backend (Allow Frontend Access)
In your local code, open `application.properties` (or `SecurityConfig.java`):

```properties
# Allow your Vercel Frontend URL
app.cors.allowedOrigins=https://lost-and-found-frontend.vercel.app
```

### 3. Push Changes
Commit and push these changes to GitHub. Render and Vercel will **automatically redeploy**!

```powershell
git add .
git commit -m "Link frontend and backend"
git push origin main
```
