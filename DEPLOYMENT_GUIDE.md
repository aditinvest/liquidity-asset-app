# Deployment Guide - Liquidity Asset App

This guide will help you deploy your application to the cloud using:
- **GitHub** - To store your code
- **Railway** - For backend API + PostgreSQL database
- **Vercel** - For frontend website

---

## 📋 Overview

Your application has 3 parts:
1. **Frontend** (React/Next.js) → Deployed on Vercel
2. **Backend** (Python/FastAPI) → Deployed on Railway
3. **Database** (PostgreSQL) → Deployed on Railway

---

## Part 1: Upload Code to GitHub

### Step 1: Install Git (if not installed)
1. Download Git from: https://git-scm.com/download/win
2. Install with default settings
3. Restart your computer after installation

### Step 2: Create GitHub Account
1. Go to https://github.com
2. Click "Sign Up"
3. Create a free account

### Step 3: Create a New Repository
1. After logging in, click the **"+"** icon (top right)
2. Select **"New repository"**
3. Repository name: `liquidity-asset-app`
4. Keep it **Public** or **Private** (your choice)
5. **DO NOT** check "Initialize this repository with a README"
6. Click **"Create repository"**

### Step 4: Upload Your Code Using GitHub Desktop (Easiest Method)

1. **Download GitHub Desktop:**
   - Go to: https://desktop.github.com
   - Download and install

2. **Clone Your Repository:**
   - Open GitHub Desktop
   - Click "File" → "Clone Repository"
   - Select the repository you just created
   - Choose a folder on your computer (e.g., `C:\Projects\liquidity-asset-app`)

3. **Copy Your Files:**
   - Copy ALL files from your current folder to the new cloned folder
   - **Important:** Do NOT copy the `venv`, `node_modules`, or `.next` folders

4. **Commit and Push:**
   - In GitHub Desktop, you'll see all your files listed
   - Write a summary: "Initial commit"
   - Click "Commit to main"
   - Click "Push origin"

### Alternative: Using Git Command Line

If you prefer command line:

```bash
# Navigate to your project folder
cd "E:\Backup C\Development Apps\liquidity -aset-app 2"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/liquidity-asset-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend + Database to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with your GitHub account
4. Railway offers $5 free credit (no credit card needed for trial)

### Step 2: Create PostgreSQL Database
1. Click **"New Project"**
2. Click **"New"** → **"Database"** → **"PostgreSQL"**
3. Wait for database to be created
4. Click on the database service
5. Go to **"Data"** tab
6. **Copy the connection URL** (looks like: `postgresql://user:password@host:port/database`)
7. Save this URL somewhere (you'll need it later)

### Step 3: Deploy Backend
1. In the same Railway project, click **"New"** → **"GitHub Repo"**
2. Select your `liquidity-asset-app` repository
3. Railway will detect it's a Python project automatically
4. Click **"Deploy"**

### Step 4: Configure Backend Environment Variables
1. Click on your backend service (the Python one)
2. Go to **"Variables"** tab
3. Add these variables:

| Variable Name | Value |
|--------------|-------|
| `DATABASE_URL` | (paste the PostgreSQL URL from Step 2) |
| `UPLOAD_DIR` | `./uploads` |
| `MAX_UPLOAD_SIZE` | `52428800` |
| `PORT` | `8000` |

4. Railway will automatically redeploy

### Step 5: Get Your Backend URL
1. Click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"**
4. Copy the URL (looks like: `https://your-app-production.up.railway.app`)
5. Save this URL - this is your **Backend API URL**

### Step 6: Initialize Database Tables
1. In Railway, click on your PostgreSQL database
2. Go to **"Data"** tab
3. Click **"Open Postgres Console"**
4. Copy and paste the contents of `backend/setup_database.sql`
5. Click "Run" to create all tables

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign in with your GitHub account

### Step 2: Import Your Repository
1. Click **"Add New..."** → **"Project"**
2. Find `liquidity-asset-app` in your GitHub repositories
3. Click **"Import"**

### Step 3: Configure Frontend
1. **Framework Preset:** Next.js (should be auto-detected)
2. **Root Directory:** Click "Edit" and enter `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`

### Step 4: Set Environment Variable for Frontend
1. Click **"Environment Variables"**
2. Add a new variable:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-app.up.railway.app/api` |

**Important:** Replace `your-railway-app.up.railway.app` with your actual Railway URL from Part 2, Step 5

3. Click **"Save"**

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes for deployment
3. Once done, you'll see a preview image
4. Click the preview to open your live website!

### Step 6: Update CORS Settings (Important!)
1. Go back to your Railway backend
2. In Railway dashboard, find your backend service
3. Go to **"Variables"**
4. You need to update the CORS settings in your code to allow Vercel domain

**Alternative:** Edit `backend/app/main.py` and change CORS to allow all domains (for development):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all domains (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then commit and push this change to GitHub - Railway will auto-deploy.

---

## Part 4: Test Your Live Application

1. Open your Vercel URL in a browser
2. Try uploading a file
3. Check if data appears correctly
4. If you see errors, check:
   - Railway backend is running (green status)
   - Environment variables are set correctly
   - CORS is configured properly

---

## Troubleshooting

### Frontend shows "API Error" or "Network Error"
- Check that `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL
- Make sure Railway backend is running (not crashed)
- Check Railway logs for errors

### Backend crashes on Railway
- Check Railway logs (click on service → "Deployments" → "View Logs")
- Verify `DATABASE_URL` is correct
- Make sure all environment variables are set

### Database tables missing
- Run the `setup_database.sql` script in Railway's Postgres console
- Or let the app auto-create tables on first run

### CORS Error in browser console
- Add your Vercel domain to the CORS allowed origins in `backend/app/main.py`
- Or temporarily use `allow_origins=["*"]` for testing

### Files upload fails
- Railway has file size limits on free tier
- Check `MAX_UPLOAD_SIZE` environment variable

---

## Updating Your App

After making changes to your code:

1. **Commit changes** in GitHub Desktop (or git command line)
2. **Push to GitHub**
3. **Railway** will automatically redeploy the backend (1-2 minutes)
4. **Vercel** will automatically redeploy the frontend (1-2 minutes)

---

## Costs

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| GitHub | Free unlimited | Free for individuals |
| Railway | $5 credit/month | $5/month for more usage |
| Vercel | Free for personal use | $20/month for teams |

---

## Support

If you get stuck:
1. Check Railway logs: Click service → "Deployments" → "View Logs"
2. Check Vercel logs: Go to project → "Deployments" → click latest → "View Build Logs"
3. Check browser console (F12) for frontend errors

---

## Quick Reference

- **GitHub Repo:** `https://github.com/YOUR_USERNAME/liquidity-asset-app`
- **Railway Dashboard:** `https://railway.app`
- **Vercel Dashboard:** `https://vercel.com/dashboard`

---

**Good luck with your deployment! 🚀**
