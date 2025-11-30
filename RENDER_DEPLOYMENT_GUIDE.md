# Render Deployment Guide (Full Stack)

**Render** is a great choice because you can host **BOTH** your Backend (Spring Boot) and Frontend (React/Vite) for free.

## 📋 Prerequisites

1. **GitHub Account**
2. **Git installed**
3. **Two Repositories** (Recommended):
   - One for Backend (`lost-and-found-backend`)
   - One for Frontend (`lost-and-found-frontend`)

---

## 🚀 Part 1: Deploy Backend (Spring Boot)

### 1. Push Backend Code to GitHub
Run inside `c:\Lost-Found-site\lost-and-found-lk-backend`:
```powershell
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lost-and-found-backend.git
git push -u origin main
```

### 2. Create Backend Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select your **Backend Repository**
4. **Settings:**
   - **Name:** `lost-and-found-backend`
   - **Runtime:** `Docker`
   - **Instance Type:** Free
5. **Environment Variables:**
   - `SPRING_DATA_MONGODB_URI`: (Your MongoDB Connection String)
   - `JWT_SECRET`: (Your Secret Key)
   - `SERVER_PORT`: `8082`
6. Click **Create Web Service**

**✅ Save your Backend URL:** (e.g., `https://lost-and-found-backend.onrender.com`)

---

## 🎨 Part 2: Deploy Frontend (React/Vite)

### 1. Update Frontend API URL
Before deploying, tell your frontend where the backend lives.
Open `src/api/axios.ts` (or wherever you define the base URL) and change it:

```typescript
// const BASE_URL = 'http://localhost:8082/api'; // OLD
const BASE_URL = 'https://lost-and-found-backend.onrender.com/api'; // NEW (Your Render Backend URL)
```

### 2. Push Frontend Code to GitHub
Run inside `c:\Lost-Found-site\lost-and-found-lk-frontend`:
```powershell
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lost-and-found-frontend.git
git push -u origin main
```

### 3. Create Frontend Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Static Site** (NOT Web Service)
3. Select your **Frontend Repository**
4. **Settings:**
   - **Name:** `lost-and-found-frontend`
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Click **Create Static Site**

**✅ Your Frontend URL:** (e.g., `https://lost-and-found-frontend.onrender.com`)

---

## 🔄 Important Notes

1. **Free Tier Spin-Down:** The **Backend** will go to sleep after 15 mins of inactivity. The first time you visit the site, it might take **30-60 seconds** to wake up. The **Frontend** (Static Site) will always be fast.
2. **CORS:** If you get CORS errors, update your Backend's `application.properties` or `SecurityConfig.java` to allow the new Frontend URL (`https://lost-and-found-frontend.onrender.com`).

---

## ⚡ Alternative for Frontend: Vercel (Recommended)
While Render works for frontends, **Vercel** is often faster and easier for React apps.
1. Go to [vercel.com](https://vercel.com)
2. "Add New Project" → Import from GitHub
3. Select Frontend Repo → Deploy
4. Done!
