# Liquidity Asset App

A web-based financial application for asset management cash flow liquidity calculation, projection, and tracking.

## Features

- **Data Import**: Upload Excel files for Cash Flow Projections and Realizations
- **Cash Flow Projections**: View and analyze projected cash flows grouped by date, sub-fund, and management type
- **Cash Flow Realization**: Track actual transactions with pivot table support
- **Manual Input**: Enter opening balances (Saldo Awal) and cash flow out transactions
- **Flexible Filtering**: Filter by sub-fund (OPEX/CAPEX), management type (Syariah/Conventional), and date ranges
- **Number Scale**: Toggle between units, thousands, millions, and billions for better readability

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Excel Processing**: pandas, openpyxl
- **Data Validation**: Pydantic

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **File Upload**: react-dropzone

## Project Structure

```
liquidity-asset-app/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── database.py          # Database configuration
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routers/             # API route handlers
│   │   └── services/            # Business logic (Excel parser)
│   ├── uploads/                 # Temporary upload directory
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment variables template
│
├── frontend/
│   ├── app/                     # Next.js app directory
│   ├── components/              # React components
│   ├── lib/                     # Utilities and API client
│   ├── package.json             # Node dependencies
│   └── .env.local               # Environment variables
│
└── README.md
```

## Database Schema

The application uses PostgreSQL with the following tables:

1. **upload_batches**: Track file upload history
2. **cf_projections**: Cash flow projection data
3. **cf_realizations**: Cash flow realization data
4. **manual_inputs**: Manual entries (opening balance, cash flow out)

## Business Logic

### OPEX/CAPEX Classification
- If `FundID` contains "JPOIP" → **OPEX**
- Otherwise → **CAPEX**

### Syariah/Conventional Classification
- **Deposito**: `Syariah = 'Yes'` → Syariah, else Conventional
- **Bond**: `Syariah = TRUE` → Syariah, else Conventional

### Bond Instruments
Each bond record creates two entries:
1. **Coupon**: Based on `NextCouponDate` and `NetCouponAmount`
2. **Maturity**: Based on `Maturity Date` and `Balance`

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb liquidity_asset_db
```

Or using psql:
```sql
CREATE DATABASE liquidity_asset_db;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
# cp .env.example .env  # Unix/Mac

# Edit .env and update DATABASE_URL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/liquidity_asset_db

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file (already created)
# .env.local is already configured

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Upload
- `POST /api/upload/projection` - Upload projection Excel file
- `POST /api/upload/realization` - Upload realization Excel file

### Projections
- `GET /api/projections/report` - Get projection report with filters
- `GET /api/projections/summary` - Get projection summary
- `GET /api/projections/instruments` - Get list of instruments

### Realizations
- `GET /api/realizations/report` - Get realization report
- `GET /api/realizations/summary` - Get realization summary
- `GET /api/realizations/pivot` - Get pivot table data

### Manual Inputs
- `POST /api/manual-inputs/` - Create manual input
- `POST /api/manual-inputs/bulk` - Create multiple manual inputs
- `GET /api/manual-inputs/` - Get manual inputs with filters
- `GET /api/manual-inputs/saldo-awal` - Get latest opening balances
- `PUT /api/manual-inputs/{id}` - Update manual input
- `DELETE /api/manual-inputs/{id}` - Delete manual input

## Excel File Formats

### Projection File

**Sheet: Deposito**
- FundID
- CounterpartID
- CounterpartName
- Maturity Date
- DepositAmount
- Syariah (Yes/No)

**Sheet: Bond**
- FundID
- SecuritiesID
- SecuritiesName
- NextCouponDate
- NetCouponAmount
- Maturity Date
- Balance
- Syariah (TRUE/FALSE)

### Realization File

**Sheets**: Depo, Obligasi, or Realisasi
- FundID
- Transaction Date
- Amount columns (varies by transaction type)
- Syariah indicator

## Usage Guide

### 1. Upload Projection Data
1. Navigate to "Data Import" tab
2. Select "Cash Flow Projection"
3. Drag & drop or select your Excel file
4. Wait for processing to complete

### 2. Upload Realization Data
1. Navigate to "Data Import" tab
2. Select "Cash Flow Realization"
3. Drag & drop or select your Excel file
4. Wait for processing to complete

### 3. Enter Manual Inputs
1. Navigate to "Manual Input" tab
2. Select input type (Opening Balance or Cash Flow Out)
3. Fill in the form
4. Click Save

### 4. View Reports
1. Navigate to "Cash Flow Projections" or "Cash Flow Realization"
2. Apply filters (month, year, sub-fund, management type)
3. Adjust number scale for better readability
4. View detailed tables or pivot views

## Development

### Running Tests

(Before production, add test suites)

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Style

```bash
# Backend linting
cd backend
flake8 app
black app --check

# Frontend linting
cd frontend
npm run lint
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists

### Port Already in Use
- Backend: Change port in uvicorn command
- Frontend: Add `PORT=3001` to frontend/.env.local

### Excel Parsing Errors
- Verify column names match expected format
- Ensure sheets exist in the file
- Check for empty or invalid data

## License

© 2026 Liquidity Asset App - Asset BP

## Support

For issues or questions, please contact the development team.
