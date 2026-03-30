# 🚀 Deploy to Render - Complete Guide

## Why Render?
- ✅ **100% Free** - No credit card required
- ✅ PostgreSQL database included
- ✅ Automatic deployments from GitHub
- ✅ Simple setup

## Limitations (Free Tier)
- Backend "sleeps" after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 1 GB storage for uploads
- 750 hours/month free (enough for 1 service always running)

---

## Step-by-Step Deployment

### Step 1: Create Render Account
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account** (easiest)
4. Verify your email

### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"Database"**
2. Configure:
   - **Name:** `liquidity-asset-db`
   - **Database:** `liquidity_asset_db`
   - **User:** `postgres`
   - **Plan:** Free
   - **Region:** Singapore (closest to Indonesia)
3. Click **"Create Database"**
4. Wait 2-3 minutes for database to be ready
5. **Copy the Internal Database URL** (looks like `postgresql://user:password@host:port/db`)
   - Click on database → **"Connection"** tab
   - Copy **"Internal Database URL"**
   - Save this!

### Step 3: Create Web Service (Backend)
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not connected
   - Find and select `liquidity-asset-app`
3. Configure the service:
   - **Name:** `liquidity-asset-backend`
   - **Region:** Singapore
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

4. Add Environment Variables:
   - Click **"Advanced"** → **"Add Environment Variable"**
   - Add these:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (paste the Internal Database URL from Step 2) |
| `UPLOAD_DIR` | `./uploads` |
| `MAX_UPLOAD_SIZE` | `52428800` |
| `PORT` | `8000` |

5. Click **"Create Web Service"**
6. Wait 3-5 minutes for deployment

### Step 4: Initialize Database Tables
1. Go back to your **database** on Render
2. Click **"Open Dashboard"** (or use psql)
3. Alternative: Use **pgAdmin** or any PostgreSQL client:
   - Host: from database connection info
   - Database: `liquidity_asset_db`
   - User: `postgres`
   - Password: from database connection info

4. Run the SQL script:
   - Open `backend/setup_database.sql` from your project
   - Copy all content
   - Paste and run in SQL console

### Step 5: Get Your Backend URL
1. Go to your **web service** on Render
2. Copy the URL at the top (looks like: `https://liquidity-asset-backend.onrender.com`)
3. **Save this URL** - you'll need it for Vercel!

### Step 6: Test Backend
1. Open your browser
2. Go to: `https://liquidity-asset-backend.onrender.com/health`
3. You should see: `{"status":"healthy"}`
   - **Note:** First request might take 30 seconds (waking up)

---

## Deploy Frontend to Vercel

### Step 1: Go to Vercel
1. Open https://vercel.com
2. Sign in with GitHub

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find `liquidity-asset-app`
3. Click **"Import"**

### Step 3: Configure
1. **Framework Preset:** Next.js
2. **Root Directory:** Click "Edit" → type `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`

### Step 4: Environment Variable
1. Click **"Environment Variables"**
2. Add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://liquidity-asset-backend.onrender.com/api` |

**Important:** Replace with YOUR actual Render URL!

3. Click **"Save"**

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Click the preview to open your live site!

---

## Troubleshooting

### Backend returns 500 error
- Check Render logs: Click service → **"Logs"** tab
- Verify `DATABASE_URL` is correct
- Make sure database tables exist

### Frontend shows "API Error"
- Check `NEXT_PUBLIC_API_URL` in Vercel matches your Render URL
- Backend might be sleeping (wait 30 seconds and retry)
- Check Render logs for errors

### Database connection error
- Verify Internal Database URL is correct (not External)
- Database and backend must be in same Render account

### File upload fails
- Free tier has 1 GB storage limit
- Files are stored on persistent disk

---

## Important Notes

### Backend Sleeping
- Free tier backend sleeps after 15 minutes of no requests
- First request after sleep takes ~30 seconds
- **Solution:** Use a free uptime monitor like https://uptimerobot.com
  - Set to ping your backend every 10 minutes
  - Keeps backend awake

### Database Persistence
- Database is **always on** (doesn't sleep)
- Data persists forever
- Free tier: 1 GB storage

---

## Your URLs

- **GitHub:** `https://github.com/aditstudy87/liquidity-asset-app`
- **Render Dashboard:** `https://dashboard.render.com`
- **Backend API:** `https://liquidity-asset-backend.onrender.com`
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **Live Site:** `https://your-app.vercel.app` (after deployment)

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| GitHub | Free | $0 |
| Render (Backend) | Free | $0 |
| Render (Database) | Free | $0 |
| Vercel (Frontend) | Free | $0 |
| **Total** | | **$0/month** ✅ |

---

**You're all set! Deploy for free! 🎉**
