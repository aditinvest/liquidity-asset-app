1. Application Architecture OverviewThe application will follow a modern full-stack architecture:Frontend: React.js or Next.js for a responsive dashboard and file upload interface.Backend: Python (FastAPI or Flask) — chosen for its superior handling of financial data (Pandas) and AI integration.Database: PostgreSQL for structured storage of portfolio snapshots and calculated cash flows.Processing Engine: A logic layer to handle the specific business rules for Deposito and Bonds.2. Database Schema (PostgreSQL)The schema is designed to handle the multi-tenant nature of OPEX/CAPEX and the distinct characteristics of Deposito vs. Bonds.SQL-- Core table for uploaded portfolio metadata
CREATE TABLE portfolio_snapshots (
    id SERIAL PRIMARY KEY,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_source_date DATE NOT NULL,
    total_assets NUMERIC
);

-- Consolidated Asset Table
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    snapshot_id INT REFERENCES portfolio_snapshots(id),
    fund_id VARCHAR(50), -- e.g., JPOIP
    sub_fund VARCHAR(10) CHECK (sub_fund IN ('OPEX', 'CAPEX')),
    management_type VARCHAR(20) CHECK (management_type IN ('Konvensional', 'Syariah')),
    asset_type VARCHAR(20) CHECK (asset_type IN ('Deposito', 'Bond')),
    security_id VARCHAR(100), -- CounterpartID or SecuritiesID
    security_name VARCHAR(255), -- CounterpartName or SecuritiesName
    maturity_date DATE,
    principal_amount NUMERIC,
    coupon_amount NUMERIC DEFAULT 0, -- For Bonds only
    frequency_months INT, -- For Bonds only
    next_coupon_date DATE,
    securities_type_desc TEXT
);

-- Generated Cash Flow Projection Table
CREATE TABLE cash_flow_projections (
    id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(id),
    sub_fund VARCHAR(10),
    cash_flow_date DATE,
    amount NUMERIC,
    flow_type VARCHAR(20) -- 'Maturity' or 'Coupon'
);
3. Key Features & Business LogicBased on your requirements, the application will implement the following logic:A. Sub-fund Identification Rule: If FundID contains "JPOIP", it is categorized as OPEX.Classification: Otherwise, categorize as CAPEX.B. Instrument ProcessingDeposito: Extract CounterpartID, CounterpartName, and DepositAmount. The maturity cash flow is mapped to the Maturity Date.Bonds: * Principal: Extract SecuritiesID, SecuritiesName, and Balance. The maturity is mapped to the Maturity Date.Coupons: Identify NetCouponAmount and Frequency. The system must auto-generate recurring cash flows starting from NextCouponDate until Maturity Date.C. Display & Scaling Users can toggle the view between Full Units, Thousands, Millions, and Billions.Monthly aggregations (Jan, Feb, etc.) for both Maturity Profiles and Calendars.4. Application FlowStep 1: Data Ingestion User uploads the "Data Portfolio Asset" Excel file.System reads two specific sheets: Deposito and Bond.Step 2: AI-Enhanced ParsingExtraction: AI identifies column headers even if they vary slightly.Syariah Check: * For Deposito: Yes = Syariah, No = Konvensional.For Bonds: TRUE = Syariah, FALSE = Konvensional.Step 3: Cash Flow Generation The system iterates through Bond instruments.Example Logic: If a bond has a NextCouponDate of 15 Jun 2026 and a 6-month frequency, the system creates entries for Dec 2026, Jun 2027, etc., until the Maturity Date.Step 4: VisualizationMaturity Profile: Bar charts (like the SBN & SUK chart provided) showing total volume per year/month .Maturity Calendar: A list or calendar view showing specific dates, bank/security names, and amounts due.5. Summary Table for DevelopersRequirementImplementation DetailSource RefInput FileExcel with sheets: "Deposito" and "Bond"OPEX LogicFundID contains "JPOIP"Syariah LogicBoolean/String check (Yes/No or True/False)Coupon ScalingRecursive addition based on FrequencyOutput FormatNumeric (Adjustable units: Thousands/Millions/Billions)