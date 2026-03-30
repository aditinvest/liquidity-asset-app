# 🚀 Deploy to Vercel + Supabase - Complete Guide

## Why This Stack?
- ✅ **Supabase:** Free PostgreSQL database + Auto API
- ✅ **Vercel:** Free frontend hosting (always on)
- ✅ **No credit card required**
- ✅ **Production-ready**

## Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel    │────▶│  Supabase    │────▶│  PostgreSQL │
│  (Frontend) │     │   (API)      │     │  (Database) │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## Part 1: Set Up Supabase (Database + API)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub account
4. Complete your profile

### Step 2: Create New Project
1. Click **"New Project"**
2. Fill in:
   - **Name:** `liquidity-asset-app`
   - **Database Password:** Create a strong password (save this!)
   - **Region:** **Southeast Asia (Singapore)**
   - **Pricing Plan:** **Free**
3. Click **"Create new project"**
4. ⏳ Wait 2-3 minutes for database to be ready

### Step 3: Get Database Connection String
1. Go to **Project Settings** (gear icon in sidebar)
2. Click **"Database"**
3. Find **"Connection string"**
4. Select **"URI"** tab
5. **Copy the connection string:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with your actual database password
7. Save this!

### Step 4: Get API Credentials
1. Go to **Project Settings** → **"API"**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbG...` (long string)
   - **service_role key:** (keep this secret!)

### Step 5: Create Database Tables
1. Go to **SQL Editor** (in left sidebar)
2. Click **"New Query"**
3. Open `backend/setup_database.sql` from your project
4. Copy all content
5. Paste into SQL Editor
6. Click **"Run"** or press Ctrl+Enter
7. ✅ Tables created!

### Step 6: Verify Tables
1. Go to **Table Editor** (in left sidebar)
2. You should see all your tables:
   - cash_flow_projections
   - cash_flow_realizations
   - manual_inputs
   - portfolios
   - etc.

---

## Part 2: Modify Backend for Supabase

Since Supabase provides its own REST API, you have two options:

### Option A: Keep FastAPI Backend (Recommended for You)
Your current FastAPI backend stays the same, just connect to Supabase database instead of local PostgreSQL.

**Benefits:**
- Minimal code changes
- Keep all existing API endpoints
- Frontend doesn't need changes

**Changes needed:**
1. Update `DATABASE_URL` to use Supabase connection string
2. Deploy backend to a platform (Render, Railway, or Fly.io)

### Option B: Use Supabase API Directly (More Changes)
Remove FastAPI backend and use Supabase's built-in REST API directly from frontend.

**Benefits:**
- No backend hosting needed
- Lower latency
- Simpler architecture

**Changes needed:**
- Rewrite frontend API calls to use Supabase client
- Set up Supabase Row Level Security (RLS)
- More development work

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub account
3. Make sure `aditinvest/liquidity-asset-app` is visible

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find `liquidity-asset-app` repository
3. Click **"Import"**

### Step 3: Configure Project
1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** Click "Edit" → type `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`

### Step 4: Set Environment Variables
Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com/api` |

**Note:** You need to deploy the backend first (see Part 4)

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. ✅ Your frontend is live!

---

## Part 4: Deploy Backend (Choose One)

Since Supabase is just the database, you still need to host the FastAPI backend somewhere.

### Option 4A: Deploy to Render (Free)
1. Go to https://render.com
2. Create account (GitHub login)
3. Create **Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Set Environment Variables:
   - `DATABASE_URL` = Supabase connection string (from Part 1, Step 3)
   - `UPLOAD_DIR` = `./uploads`
   - `MAX_UPLOAD_SIZE` = `52428800`
   - `PORT` = `8000`
7. Deploy!

### Option 4B: Deploy to Railway (Requires Credit Card)
Same as Render, but on Railway.app

### Option 4C: Deploy to Fly.io
1. Install Fly.io CLI
2. `fly launch`
3. Configure for Supabase database

---

## Part 5: Update Frontend API URL

After backend is deployed:

1. Go to **Vercel Dashboard** → Your project
2. Go to **"Settings"** → **"Environment Variables"**
3. Edit `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```
4. Click **"Save"**
5. Redeploy (Vercel will auto-redeploy)

---

## Part 6: Test Your Application

1. Open your Vercel URL
2. Try uploading a file
3. Check if data appears in Supabase Table Editor
4. Test all features

---

## Environment Variables Summary

### Supabase
| Variable | Where to Set | Value |
|----------|--------------|-------|
| `DATABASE_URL` | Backend hosting | Supabase connection string |
| `SUPABASE_URL` | Frontend (optional) | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Frontend (optional) | anon/public key |

### Vercel
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.com/api` |

### Backend Hosting
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase connection string |
| `UPLOAD_DIR` | `./uploads` |
| `MAX_UPLOAD_SIZE` | `52428800` |
| `PORT` | `8000` |

---

## Troubleshooting

### Can't connect to Supabase database
- Verify connection string has correct password
- Check database is active (not paused)
- Ensure IP is not blocked (Supabase allows all by default)

### Frontend can't reach backend
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running (check logs)
- Test backend health endpoint: `/health`

### Database tables missing
- Run `setup_database.sql` in Supabase SQL Editor
- Check for SQL errors

### CORS errors
- Backend CORS is already set to allow all (`*`)
- Check browser console for details

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| GitHub | Free | $0 |
| Supabase | Free | $0 (500MB DB, 2GB bandwidth) |
| Vercel | Free | $0 |
| Render (Backend) | Free | $0 |
| **Total** | | **$0/month** ✅ |

---

## Your URLs

- **GitHub:** `https://github.com/aditinvest/liquidity-asset-app`
- **Supabase Dashboard:** `https://app.supabase.com`
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com`
- **Supabase DB:** `https://xxxxx.supabase.co`

---

**Ready to deploy! 🚀**
