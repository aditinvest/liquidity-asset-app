Framework Documentation - Liquidity Asset App1. App OverviewLiquidity Asset App is a web-based financial application designed to assist asset management in calculating, projecting, and tracking cash flow liquidity. This application processes raw data from Excel files (Portfolio & Realization) into structured projection and realization pivot reports, categorized by sub-funds (OPEX/CAPEX) and management types (Syariah/Conventional).2. Tech Stack Recommendations (Full-Stack)To handle heavy Excel file processing, high-level decimal accuracy, and interactive reporting interfaces, here are the recommended tech stacks:Frontend: React.js (Next.js) + Tailwind CSSReason: SSR/SSG from Next.js provides excellent performance. Tailwind speeds up UI development. Libraries like ag-grid or tanstack-table can be used to render complex pivot tables/reports.Backend: Python (FastAPI) or Node.js (NestJS)Reason: If using Python, the pandas library is incredibly powerful for reading Excel files (Deposito & Bond sheets) and performing data transformations (JPOIP filtering, boolean conversion). If using Node.js, xlsx or exceljs can be utilized.Database: PostgreSQLReason: Highly reliable for financial transactions, supports NUMERIC data types to prevent rounding errors on trillion-scale figures, and possesses excellent query grouping/windowing capabilities.3. Core FeaturesData Import Module (File Upload)Upload Data CF Projection Asset (Sheets: Deposito & Bond).Upload Data CF Realisasi Asset BP xxxx (Sheets: Depo & Obligasi).Column format validation during upload.Manual Input ModuleOpening Balance (Saldo Awal) input form (Based on date, sub-fund, and management type).Cash Flow Out input form (Date, Nominal Amount, Description).Data Processing Engine (Data Transformation)Automatic OPEX/CAPEX identification (Condition: If FundID contains the word "JPOIP" -> OPEX, otherwise CAPEX).Automatic Syariah/Conventional identification (Deposit: Yes/No. Bond: TRUE/FALSE).Separation of Coupon and Maturity values for Bond instruments.Reporting Module (Reporting & Pivot)Cashflow Projections: Grouped reports per month (Jan, Feb, etc.) or detailed per date.Cashflow Realization: Pivot reports based on activities (Disbursement, Placement, Maturity, Purchase).Global Filters: Sub-fund (OPEX/CAPEX), Management Type (Syariah/Conventional/Combined).Number Scale Adjustment: Toggle to display figures in units (Thousands, Millions, Billions).4. System FlowA. Cashflow Projection FlowUser Action: The user clicks the "Upload Projection" button and selects an Excel file.Backend Parsing: * The system reads the Deposito Sheet: Maps FundID -> OPEX/CAPEX, Syariah (Yes/No) -> Syariah/Conventional, CounterpartID, CounterpartName, Maturity Date, DepositAmount.The system reads the Bond Sheet: Creates 2 records for each row.Record 1 (Coupon): Maps NextCouponDate & NetCouponAmount.Record 2 (Maturity): Maps Maturity Date & Balance.Data Storing: The data is saved into the cf_projections table in the database.Manual Input: The user inputs the Opening Balance and Cash Flow Out projections via the UI. Saved into the manual_inputs table.Data Fetching & Display: The frontend requests data with filter parameters. The backend calculates: Opening Balance + Total CF In (Deposit + Bond) - Total CF Out = Ending Balance. Displayed as a matrix Pivot table.B. Cashflow Realization FlowUser Action: The user clicks the "Upload Realization" button and uploads the file.Backend Parsing: The system extracts data from the relevant sheets. It identifies the transaction type (Deposit Disbursement, Deposit Placement, Bond Maturity, Bond Purchase, Coupon). The rule where FundID containing "JPOIP" = OPEX still applies.Data Fetching: Data is queried from the cf_realizations table and grouped by date (X-Axis) and Transaction Type & Issuer (Y-Axis).5. Database Schema (PostgreSQL)Below is the relational database schema design to handle the logic above. Using NUMERIC(20, 2) because figures can reach Trillions (15 digits).-- 1. Table to track file upload history
CREATE TABLE upload_batches (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    upload_type VARCHAR(50) CHECK (upload_type IN ('PROJECTION', 'REALIZATION')),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100)
);

-- 2. Cashflow Projection Master Table
CREATE TABLE cf_projections (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES upload_batches(id) ON DELETE CASCADE,
    sub_fund VARCHAR(10) CHECK (sub_fund IN ('OPEX', 'CAPEX')),
    management_type VARCHAR(20) CHECK (management_type IN ('SYARIAH', 'KONVENSIONAL')),
    instrument_type VARCHAR(20) CHECK (instrument_type IN ('DEPOSITO', 'BOND_COUPON', 'BOND_MATURITY')),
    fund_id VARCHAR(100),
    instrument_code VARCHAR(100), -- CounterpartID / SecuritiesID
    instrument_name VARCHAR(255), -- CounterpartName / SecuritiesName
    transaction_date DATE NOT NULL, -- Maturity Date / NextCouponDate
    amount NUMERIC(20, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing to speed up date and category filtering queries
CREATE INDEX idx_proj_date ON cf_projections(transaction_date);
CREATE INDEX idx_proj_fund_mgmt ON cf_projections(sub_fund, management_type);

-- 3. Cashflow Realization Master Table
CREATE TABLE cf_realizations (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES upload_batches(id) ON DELETE CASCADE,
    sub_fund VARCHAR(10) CHECK (sub_fund IN ('OPEX', 'CAPEX')),
    management_type VARCHAR(20) CHECK (management_type IN ('SYARIAH', 'KONVENSIONAL')),
    transaction_category VARCHAR(50), -- Deposit Disbursement, Bond Purchase, etc.
    fund_id VARCHAR(100),
    instrument_name VARCHAR(255), -- BSI, BJBR, FR0059, etc.
    transaction_date DATE NOT NULL,
    proceed_amount NUMERIC(20, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Manual Input Table (Opening Balance & Cash Flow Out)
CREATE TABLE manual_inputs (
    id SERIAL PRIMARY KEY,
    input_type VARCHAR(20) CHECK (input_type IN ('SALDO_AWAL', 'CF_OUT')),
    sub_fund VARCHAR(10) CHECK (sub_fund IN ('OPEX', 'CAPEX')),
    management_type VARCHAR(20) CHECK (management_type IN ('SYARIAH', 'KONVENSIONAL')),
    transaction_date DATE NOT NULL,
    amount NUMERIC(20, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
6. Logic Mapping (Backend Pseudo-code)To ensure data processing complies with the PDF specifications, here is the logic abstraction when reading Excel:# Pseudo-code / Python Pandas concept
def parse_projection_row(row, instrument):
    # 1. Determine OPEX / CAPEX
    sub_fund = "OPEX" if "JPOIP" in str(row['FundID']) else "CAPEX"
    
    # 2. Determine Syariah / Conventional
    if instrument == 'DEPOSITO':
        mgmt_type = "SYARIAH" if row['Syariah'] == 'Yes' else "KONVENSIONAL"
    else: # BOND
        mgmt_type = "SYARIAH" if row['Syariah'] == True else "KONVENSIONAL"
        
    return sub_fund, mgmt_type
7. API Endpoint Design (RESTful)POST /api/upload/projection : Receives multipart/form-data Excel, returns a success summary.POST /api/upload/realization : Receives multipart/form-data realization Excel.GET /api/projections/report :Query Params: month, year, sub_fund (OPEX/CAPEX), management_type (Syariah/Conventional).Response: JSON containing Opening Balance, grouped array per date (CF In Deposit, CF In Bond, CF Out), and Net Cashflow.POST /api/manual-inputs : Saves daily Opening Balance or CF Out.