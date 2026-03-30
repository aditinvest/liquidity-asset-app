# Quick Start Guide - Liquidity Asset App

## Prerequisites Installation

### 1. Install Python (for Backend)
1. Download Python 3.9+ from https://www.python.org/downloads/
2. During installation, **check "Add Python to PATH"**
3. Verify installation: `python --version`

### 2. Install PostgreSQL (Database)
1. Download PostgreSQL 14+ from https://www.postgresql.org/download/
2. During installation, remember the password you set for 'postgres' user
3. Verify installation: `psql --version`

### 3. Node.js (already installed ✓)
- Version: v24.13.1

---

## Setup Steps

### Step 1: Create PostgreSQL Database

**Option A: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `liquidity_asset_db`
4. Click "Save"

**Option B: Using psql command line**
```bash
psql -U postgres
CREATE DATABASE liquidity_asset_db;
\q
```

**Option C: Run the setup script**
```bash
# Navigate to backend directory
cd backend

# Run the SQL script
psql -U postgres -f setup_database.sql
```

### Step 2: Configure Backend

1. Navigate to `backend` folder
2. Create `.env` file (or edit existing):
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/liquidity_asset_db
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=52428800
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### Step 3: Install Backend Dependencies

**Important: Python must be installed first**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Frontend Dependencies (Already Installed ✓)

Frontend dependencies are already installed in the `frontend` folder.

---

## Running the Application

### Option 1: Using Start Script (Recommended)

Simply double-click `start.bat` or run:
```bash
.\start.bat
```

This will start both backend and frontend servers automatically.

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Access the Application

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## First Time Usage

### 1. Upload Projection Data
- Go to "Data Import" tab
- Select "Cash Flow Projection"
- Upload your Excel file with sheets: "Deposito" and "Bond"

### 2. Upload Realization Data
- Go to "Data Import" tab
- Select "Cash Flow Realization"
- Upload your Excel file

### 3. Enter Opening Balances
- Go to "Manual Input" tab
- Select "Opening Balance (Saldo Awal)"
- Fill in the form for each sub-fund and management type

### 4. View Reports
- Navigate to "Cash Flow Projections" or "Cash Flow Realization"
- Apply filters as needed
- Adjust number scale for better readability

---

## Troubleshooting

### Backend won't start
- **Python not found**: Install Python and add to PATH
- **Virtual environment error**: Delete `venv` folder and recreate
- **Database connection error**: Check DATABASE_URL in `.env`

### Frontend won't start
- **Port 3000 in use**: Edit `frontend/.env.local` and add `PORT=3001`
- **Module not found**: Run `npm install` in frontend folder

### Database errors
- **Database doesn't exist**: Create `liquidity_asset_db` database
- **Authentication failed**: Check username/password in DATABASE_URL
- **Tables missing**: Run `setup_database.sql` script

### Excel upload errors
- **Invalid file format**: Ensure file is `.xlsx` format
- **Missing sheets**: Check that required sheets exist
- **Column mismatch**: Verify column names match the specification

---

## Development Tips

### Hot Reload
Both servers support hot reload:
- Backend: Auto-reloads on Python file changes
- Frontend: Auto-refreshes on React component changes

### API Testing
Use the interactive API docs at http://localhost:8000/docs to test endpoints directly.

### Database Viewer
Use pgAdmin or any PostgreSQL client to view and query the database.

---

## Next Steps

1. **Customize Branding**: Edit `frontend/app/layout.tsx` for app title and metadata
2. **Add Authentication**: Implement user login system
3. **Enhance Reports**: Add charts and export functionality
4. **Deploy to Production**: Set up on cloud platform (AWS, GCP, Azure)

---

## Support

For issues or questions:
1. Check the API documentation: http://localhost:8000/docs
2. Review the main README.md for detailed information
3. Check application logs in the terminal windows

---

**Happy Coding! 🚀**
