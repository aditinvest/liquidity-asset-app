# 🚀 Quick Deployment Checklist - Render (FREE)

Follow these steps in order. Check off each item as you complete it.

---

## ✅ Part 1: GitHub (Already Done! ✓)

- [x] Code pushed to GitHub: `https://github.com/aditstudy87/liquidity-asset-app`

---

## ✅ Part 2: Render Setup (Backend + Database)

### Create Account
- [ ] Go to https://render.com
- [ ] Click "Get Started for Free"
- [ ] Sign up with GitHub account
- [ ] Verify email

### Create Database
- [ ] Click "New +" → "Database"
- [ ] Name: `liquidity-asset-db`
- [ ] Database name: `liquidity_asset_db`
- [ ] Plan: **Free**
- [ ] Region: **Singapore**
- [ ] Click "Create Database"
- [ ] Wait 2-3 minutes
- [ ] **Copy Internal Database URL** (Connection tab)
  - Save this! Example: `postgresql://user:pass@host:port/db`

### Create Web Service (Backend)
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub and select `liquidity-asset-app`
- [ ] Configure:
  - [ ] Name: `liquidity-asset-backend`
  - [ ] Region: Singapore
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `pip install -r requirements.txt`
  - [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - [ ] Instance Type: **Free**

### Set Environment Variables
- [ ] Click "Advanced" → Add these variables:
  - [ ] `DATABASE_URL` = (paste Internal Database URL)
  - [ ] `UPLOAD_DIR` = `./uploads`
  - [ ] `MAX_UPLOAD_SIZE` = `52428800`
  - [ ] `PORT` = `8000`

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait 3-5 minutes
- [ ] Check logs for errors

### Initialize Database
- [ ] Open `backend/setup_database.sql`
- [ ] Copy all content
- [ ] Run in database using pgAdmin or Render dashboard

### Get Backend URL
- [ ] Copy your service URL
- [ ] Example: `https://liquidity-asset-backend.onrender.com`
- [ ] **Test:** Open `/health` endpoint in browser
  - Should see: `{"status":"healthy"}`

---

## ✅ Part 3: Vercel Setup (Frontend)

### Create Account
- [ ] Go to https://vercel.com
- [ ] Sign in with GitHub

### Deploy
- [ ] Click "Add New..." → "Project"
- [ ] Find `liquidity-asset-app`
- [ ] Click "Import"
- [ ] Configure:
  - [ ] Framework: **Next.js**
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
- [ ] Set Environment Variable:
  - [ ] `NEXT_PUBLIC_API_URL` = `https://YOUR-RENDER-URL.onrender.com/api`
  - [ ] **Important:** Replace with your actual Render URL!
- [ ] Click "Deploy"
- [ ] Wait 2-5 minutes

---

## ✅ Part 4: Test

- [ ] Open your Vercel URL
- [ ] Navigate through pages
- [ ] Try uploading a file
- [ ] Check data appears correctly

---

## 🔧 Troubleshooting

### Backend is slow (30 seconds)
- ✅ Normal! Free tier sleeps after 15 minutes
- **Fix:** Use https://uptimerobot.com to ping every 10 minutes

### Frontend shows "API Error"
- [ ] Check `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Verify Render backend is running (check logs)
- [ ] Wait 30 seconds and retry (backend might be waking up)

### Database errors
- [ ] Verify `DATABASE_URL` is correct
- [ ] Run `setup_database.sql` to create tables

---

## 📝 Save Your URLs

- **Backend API:** `https://_____________________.onrender.com`
- **Frontend:** `https://_____________________.vercel.app`

---

## 💰 Total Cost: **$0/month** ✅

---

**You've got this! Take your time and follow each step! 💪**
