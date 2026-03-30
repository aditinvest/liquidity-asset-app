# 🚀 Deploy to Replit - Complete Guide (NO Credit Card!)

## Why Replit?
- ✅ **100% Free** - No credit card required
- ✅ PostgreSQL database included
- ✅ Hosts both frontend and backend
- ✅ Simple setup - just import from GitHub
- ✅ Built-in code editor and terminal

## Limitations (Free Tier)
- App "sleeps" after 1 hour of inactivity
- First request after sleep takes ~10 seconds to wake up
- Limited resources (enough for small apps)

---

## Step-by-Step Deployment

### Step 1: Create Replit Account
1. Go to https://replit.com
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Replit
5. Complete your profile

### Step 2: Import Your Project
1. Click **"+ Create Repl"** (top left)
2. Select **"Import from GitHub"**
3. Paste your repository URL:
   ```
   https://github.com/aditstudy87/liquidity-asset-app
   ```
4. Click **"Import"**
5. Wait for Replit to clone your repository

### Step 3: Configure Backend

1. **Set up Python environment:**
   - Replit will auto-detect Python in `backend/` folder
   - Click on `backend/requirements.txt` to verify

2. **Create `.replit` file** in the root directory:
   - Click **"Add file"** → Name it `.replit`
   - Paste this content:

```toml
language = "python3"

[run]
repl = "backend"
command = "cd backend && pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

3. **Create `replit.nix`** file:
   - Click **"Add file"** → Name it `replit.nix`
   - Paste this:

```nix
{ pkgs }: {
  deps = [
    pkgs.python311
    pkgs.postgresql
  ];
}
```

### Step 4: Set Up Database

Replit has built-in PostgreSQL support:

1. Click on **"Tools"** (left sidebar) → **"PostgreSQL"**
2. Click **"Start Database"**
3. Wait for database to initialize
4. Copy the **Connection String** (DATABASE_URL)
   - Looks like: `postgresql://user:password@host:port/db`

### Step 5: Set Environment Variables

1. Click on **"Secrets"** (lock icon in left sidebar)
2. Add these secrets:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (paste PostgreSQL connection string from Step 4) |
| `UPLOAD_DIR` | `./uploads` |
| `MAX_UPLOAD_SIZE` | `52428800` |
| `PORT` | `8000` |

3. Click **"Add Secret"** for each one

### Step 6: Initialize Database Tables

1. Click on **"Shell"** (terminal icon in left sidebar)
2. Navigate to backend folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the SQL script:
   - Open `backend/setup_database.sql`
   - Copy all content
   - In the PostgreSQL tool, paste and run the SQL

### Step 7: Run Your Backend

1. Click the big green **"Run"** button (top)
2. Replit will:
   - Install dependencies
   - Start the FastAPI server
3. Wait for "Application startup complete" message
4. You'll see your app URL at the top:
   - Example: `https://liquidity-asset-app.aditstudy87.repl.co`

### Step 8: Test Backend

1. Open the **Webview** (appears when you run)
2. Go to: `/health`
3. Should see: `{"status":"healthy"}`
4. Go to: `/docs` to see API documentation

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
| `NEXT_PUBLIC_API_URL` | `https://liquidity-asset-app.aditstudy87.repl.co/api` |

**Important:** Replace with YOUR actual Replit URL!

3. Click **"Save"**

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Click the preview to open your live site!

---

## Troubleshooting

### Backend won't start
- Check the **Console** for errors
- Verify `DATABASE_URL` is correct
- Make sure PostgreSQL database is running

### Database connection error
- Click **"PostgreSQL"** tool → ensure database is started
- Verify `DATABASE_URL` in Secrets is correct
- Run `setup_database.sql` to create tables

### Frontend shows "API Error"
- Check `NEXT_PUBLIC_API_URL` in Vercel matches Replit URL
- Backend might be sleeping (wait 10 seconds and retry)
- Check Replit console for errors

### Port error
- Replit auto-assigns ports
- Make sure `PORT` environment variable is set to `8000`

---

## Important Notes

### Keeping Backend Awake
Free Replit apps sleep after 1 hour of inactivity:
- **Solution:** Use https://uptimerobot.com (free)
- Set to ping your Replit URL every 30 minutes
- Keeps backend awake

### File Storage
- Files in `uploads/` folder persist between runs
- Free tier has limited storage (enough for testing)

---

## Your URLs

- **GitHub:** `https://github.com/aditstudy87/liquidity-asset-app`
- **Replit:** `https://liquidity-asset-app.aditstudy87.repl.co`
- **Replit Dashboard:** `https://replit.com/~`
- **Vercel:** `https://your-app.vercel.app` (after deployment)

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| GitHub | Free | $0 |
| Replit (Backend + DB) | Free | $0 |
| Vercel (Frontend) | Free | $0 |
| **Total** | | **$0/month** ✅ |

---

**No credit card needed! Deploy for free! 🎉**
