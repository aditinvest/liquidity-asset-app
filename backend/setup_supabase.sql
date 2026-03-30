-- Supabase Database Setup Script
-- Drop existing tables first (if any)
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS manual_inputs CASCADE;
DROP TABLE IF EXISTS cf_realizations CASCADE;
DROP TABLE IF EXISTS cf_projections CASCADE;
DROP TABLE IF EXISTS upload_batches CASCADE;
DROP TABLE IF EXISTS opening_balances CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table to track file upload history
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
    instrument_code VARCHAR(100),
    instrument_name VARCHAR(255),
    transaction_date DATE NOT NULL,
    amount NUMERIC(20, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cashflow Realization Master Table
CREATE TABLE cf_realizations (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES upload_batches(id) ON DELETE CASCADE,
    sub_fund VARCHAR(10) CHECK (sub_fund IN ('OPEX', 'CAPEX')),
    management_type VARCHAR(20) CHECK (management_type IN ('SYARIAH', 'KONVENSIONAL')),
    transaction_category VARCHAR(50),
    fund_id VARCHAR(100),
    instrument_name VARCHAR(255),
    transaction_date DATE NOT NULL,
    proceed_amount NUMERIC(20, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Manual Input Table
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

-- 5. Portfolio Table
CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    sub_fund VARCHAR(10),
    management_type VARCHAR(20),
    instrument_type VARCHAR(50),
    instrument_code VARCHAR(100),
    instrument_name VARCHAR(255),
    nominal NUMERIC(20, 2),
    pencairan VARCHAR(50),
    custodian VARCHAR(100),
    tanggal_per TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Opening Balances Table
CREATE TABLE opening_balances (
    id SERIAL PRIMARY KEY,
    sub_fund VARCHAR(10),
    management_type VARCHAR(20),
    balance_date DATE,
    amount NUMERIC(20, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
