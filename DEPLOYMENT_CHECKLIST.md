# 🚀 Quick Deployment Checklist

Follow these steps in order. Check off each item as you complete it.

---

## ✅ Part 1: GitHub Setup

- [ ] Install Git from https://git-scm.com/download/win
- [ ] Create GitHub account at https://github.com
- [ ] Create new repository named `liquidity-asset-app`
- [ ] Install GitHub Desktop from https://desktop.github.com
- [ ] Clone your repository to your computer
- [ ] Copy all project files to the cloned folder
  - [ ] **DON'T copy:** `venv`, `node_modules`, `.next`, `__pycache__` folders
- [ ] Commit with message "Initial commit"
- [ ] Push to GitHub

---

## ✅ Part 2: Railway Setup (Backend + Database)

- [ ] Create Railway account at https://railway.app (use GitHub login)
- [ ] Create new project
- [ ] Add PostgreSQL database:
  - [ ] Click "New" → "Database" → "PostgreSQL"
  - [ ] Wait for it to deploy
  - [ ] Click on database → "Data" tab
  - [ ] **Copy the DATABASE_URL** (save this!)
- [ ] Deploy backend:
  - [ ] Click "New" → "GitHub Repo"
  - [ ] Select `liquidity-asset-app`
  - [ ] Click "Deploy"
- [ ] Set environment variables (click backend service → "Variables"):
  - [ ] `DATABASE_URL` = (paste the URL you copied)
  - [ ] `UPLOAD_DIR` = `./uploads`
  - [ ] `MAX_UPLOAD_SIZE` = `52428800`
  - [ ] `PORT` = `8000`
- [ ] Initialize database:
  - [ ] Click database service → "Data" → "Open Postgres Console"
  - [ ] Open file `backend/setup_database.sql`
  - [ ] Copy all contents and paste in console
  - [ ] Click "Run"
- [ ] **Copy your backend URL** (Settings → Domains)
  - Example: `https://your-app-production.up.railway.app`

---

## ✅ Part 3: Vercel Setup (Frontend)

- [ ] Create Vercel account at https://vercel.com (use GitHub login)
- [ ] Click "Add New..." → "Project"
- [ ] Find and import `liquidity-asset-app`
- [ ] Configure:
  - [ ] Framework Preset: **Next.js** (auto-detected)
  - [ ] Root Directory: Click "Edit" → type `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
- [ ] Set environment variable:
  - [ ] Click "Environment Variables"
  - [ ] Add: `NEXT_PUBLIC_API_URL` = `https://YOUR-RAILWAY-APP.up.railway.app/api`
  - [ ] **Important:** Replace `YOUR-RAILWAY-APP` with your actual Railway URL
  - [ ] Click "Save"
- [ ] Click "Deploy"
- [ ] Wait 2-5 minutes
- [ ] Click the preview to open your live site!

---

## ✅ Part 4: Test Your App

- [ ] Open your Vercel URL in browser
- [ ] Try navigating to different pages
- [ ] Try uploading a test file
- [ ] Check if data appears correctly

---

## 🔧 If Something Goes Wrong

### Frontend shows "API Error"
- [ ] Check Railway backend is running (green status)
- [ ] Verify `NEXT_PUBLIC_API_URL` in Vercel matches Railway URL
- [ ] Check Railway logs for errors

### Backend crashed on Railway
- [ ] Click backend service → "Deployments" → "View Logs"
- [ ] Check if `DATABASE_URL` is correct
- [ ] Verify all environment variables are set

### CORS error in browser (F12 console)
- [ ] Backend CORS is already set to allow all domains (`*`)
- [ ] If still issues, redeploy backend on Railway

---

## 📝 Important URLs to Save

- **GitHub Repository:** `https://github.com/YOUR_USERNAME/liquidity-asset-app`
- **Railway Dashboard:** `https://railway.app`
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **Your Live Site:** `https://your-app.vercel.app` (after deployment)

---

## 💰 Cost Summary

All services have free tiers:
- **GitHub:** Free ✅
- **Railway:** $5 credit/month (enough for small apps) ✅
- **Vercel:** Free for personal use ✅

---

## 📞 Need Help?

1. Check the detailed guide: `DEPLOYMENT_GUIDE.md`
2. Railway Support: https://railway.app/help
3. Vercel Support: https://vercel.com/docs
4. GitHub Docs: https://docs.github.com

---

**Good luck! You've got this! 💪**
