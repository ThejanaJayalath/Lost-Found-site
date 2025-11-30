# Render Deployment Guide (Free & No Credit Card)

Since Oracle Cloud isn't an option, **Render** is the best alternative. It allows you to host your Spring Boot backend for free without a credit card.

## 📋 Prerequisites

1. **GitHub Account**
2. **Git installed** on your computer
3. **Your project pushed to GitHub**

---

## 🚀 Option 1: Deploy to Render (Permanent Cloud Hosting)

### Step 1: Push Your Code to GitHub

If you haven't already pushed your code to GitHub, do this now:

1. Create a new repository on GitHub (e.g., `lost-and-found-backend`).
2. Run these commands in your backend folder (`c:\Lost-Found-site\lost-and-found-lk-backend`):

```powershell
git init
git add .
git commit -m "Initial commit for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lost-and-found-backend.git
git push -u origin main
```

### Step 2: Create Service on Render

1. Go to [render.com](https://render.com) and sign up (use "Continue with GitHub").
2. Click **"New +"** → **"Web Service"**.
3. Select **"Build and deploy from a Git repository"**.
4. Connect your GitHub account and select your `lost-and-found-backend` repository.

### Step 3: Configure Render

- **Name:** `lost-and-found-backend`
- **Region:** Choose the one closest to you (e.g., Singapore or Frankfurt).
- **Branch:** `main`
- **Runtime:** `Docker` (It should detect the Dockerfile I created).
- **Instance Type:** **Free** (0.1 CPU, 512MB RAM).

### Step 4: Environment Variables

Scroll down to **"Environment Variables"** and add these:

| Key | Value |
|-----|-------|
| `SPRING_DATA_MONGODB_URI` | `mongodb+srv://todoListApp:sinhalanews@cluster0.gdcsnzk.mongodb.net/lost_and_found?retryWrites=true&w=majority` |
| `JWT_SECRET` | `5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437` |
| `SERVER_PORT` | `8082` |

### Step 5: Deploy

1. Click **"Create Web Service"**.
2. Render will start building your app (this takes 5-10 minutes).
3. Once done, you'll get a URL like: `https://lost-and-found-backend.onrender.com`.

> [!NOTE]
> The free tier "spins down" after 15 minutes of inactivity. The first request after a break will take about 30-50 seconds to load.

---

## ⚡ Option 2: Ngrok (Instant Demo from Laptop)

If you just want to show your project to someone **right now** without deploying code:

1. **Download Ngrok:** [ngrok.com/download](https://ngrok.com/download)
2. **Run your backend locally:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
3. **Open a new terminal and run Ngrok:**
   ```powershell
   ngrok http 8082
   ```
4. **Copy the Forwarding URL:** (e.g., `https://a1b2-c3d4.ngrok-free.app`)
5. **Use this URL** in your frontend code as the backend API URL.

**Note:** This only works while your laptop is on and the command is running.

---

## 🔄 Update Your Frontend

Once deployed (or using Ngrok), update your frontend API URL:

**File:** `src/api/axios.ts` (or wherever you defined the base URL)

```typescript
// Change this:
const BASE_URL = 'http://localhost:8082/api';

// To your Render URL:
const BASE_URL = 'https://lost-and-found-backend.onrender.com/api';
```
