-- Liquidity Asset App Database Setup Script
-- Run this script to create the database and tables

-- Create database (run as postgres superuser)
-- DROP DATABASE IF EXISTS liquidity_asset_db;
CREATE DATABASE liquidity_asset_db;

-- Connect to the database
\c liquidity_asset_db;

-- Enable UUID extension (optional, for future use)
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

-- Indexing to speed up date and category filtering queries
CREATE INDEX idx_proj_date ON cf_projections(transaction_date);
CREATE INDEX idx_proj_fund_mgmt ON cf_projections(sub_fund, management_type);
CREATE INDEX idx_proj_batch ON cf_projections(batch_id);

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

-- Indexing
CREATE INDEX idx_real_date ON cf_realizations(transaction_date);
CREATE INDEX idx_real_fund_mgmt ON cf_realizations(sub_fund, management_type);
CREATE INDEX idx_real_batch ON cf_realizations(batch_id);
CREATE INDEX idx_real_category ON cf_realizations(transaction_category);

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

-- Indexing
CREATE INDEX idx_manual_date ON manual_inputs(transaction_date);
CREATE INDEX idx_manual_type ON manual_inputs(input_type);
CREATE INDEX idx_manual_fund_mgmt ON manual_inputs(sub_fund, management_type);

-- Create a user for the application (optional, for production)
-- CREATE USER liquidity_app WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON TABLE upload_batches TO liquidity_app;
-- GRANT ALL PRIVILEGES ON TABLE cf_projections TO liquidity_app;
-- GRANT ALL PRIVILEGES ON TABLE cf_realizations TO liquidity_app;
-- GRANT ALL PRIVILEGES ON TABLE manual_inputs TO liquidity_app;
-- GRANT USAGE, SELECT ON SEQUENCE upload_batches_id_seq TO liquidity_app;
-- GRANT USAGE, SELECT ON SEQUENCE cf_projections_id_seq TO liquidity_app;
-- GRANT USAGE, SELECT ON SEQUENCE cf_realizations_id_seq TO liquidity_app;
-- GRANT USAGE, SELECT ON SEQUENCE manual_inputs_id_seq TO liquidity_app;

-- Insert sample data for testing (optional)
-- Uncomment to add sample data

/*
-- Sample upload batch
INSERT INTO upload_batches (file_name, upload_type, uploaded_by) 
VALUES ('sample_projection.xlsx', 'PROJECTION', 'admin');

-- Sample manual input (Saldo Awal)
INSERT INTO manual_inputs (input_type, sub_fund, management_type, transaction_date, amount, description)
VALUES 
    ('SALDO_AWAL', 'OPEX', 'SYARIAH', '2026-03-01', 50000000000.00, 'Opening Balance March 2026'),
    ('SALDO_AWAL', 'OPEX', 'KONVENSIONAL', '2026-03-01', 75000000000.00, 'Opening Balance March 2026'),
    ('SALDO_AWAL', 'CAPEX', 'SYARIAH', '2026-03-01', 100000000000.00, 'Opening Balance March 2026'),
    ('SALDO_AWAL', 'CAPEX', 'KONVENSIONAL', '2026-03-01', 150000000000.00, 'Opening Balance March 2026');
*/

-- Verify tables created
\dt
