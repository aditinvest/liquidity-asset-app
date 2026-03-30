# Maturity Profile Upload Fix

## Problem
When uploading the file `Data Portfolio Asset BP 27022026.xlsx` in the Maturity Profile feature, the data was not showing up.

## Root Cause
The Excel file has different column naming conventions than what the code expected:
- **Sheet names**: `Depo` and `Bond` (not `Deposito` and `Bond`)
- **Column names**: `MaturityDate`, `NextCouponDate`, `DepositAmount` (without spaces, not `Maturity Date`, etc.)

The original code was looking for columns with spaces, causing the parsing to fail silently and skip all records.

## Solution
Updated `backend/app/routers/portfolio.py` to handle multiple column name variations:

### Changes Made

1. **Flexible Column Name Handling** (Lines 62-70):
   ```python
   # Parse maturity date - handle both "MaturityDate" and "Maturity Date"
   maturity_date = row.get('MaturityDate') if 'MaturityDate' in row else row.get('Maturity Date')
   
   # Parse amount - handle both "DepositAmount" and "Amount"
   principal_amount = row.get('DepositAmount', row.get('Amount', 0))
   ```

2. **Bond Sheet Column Handling** (Lines 117-135):
   ```python
   # Handle both "MaturityDate" and "Maturity Date" column names
   maturity_date_col = 'MaturityDate' if 'MaturityDate' in row else 'Maturity Date'
   maturity_date = parse_date(row.get(maturity_date_col))
   
   # Handle both "NextCouponDate" and "Next Coupon Date" column names
   next_coupon_date_col = 'NextCouponDate' if 'NextCouponDate' in row else 'Next Coupon Date'
   next_coupon_date = parse_date(row.get(next_coupon_date_col))
   
   # Handle amount variations
   principal_amount = row.get('Balance', row.get('BalanceAmount', 0))
   coupon_amount = row.get('NetCouponAmount', row.get('Net_Coupon_Amount', 0))
   ```

3. **Updated API Patterns** to accept `BOND_COUPON` asset type:
   - `/api/portfolio/profile` - Pattern: `^(DEPOSITO|BOND|BOND_COUPON)$`
   - `/api/portfolio/calendar` - Pattern: `^(DEPOSITO|BOND|BOND_COUPON)$`

## Test Results

### Upload Test
```
✅ Upload successful!
Status Code: 200
Response: {
    'data_source_date': '2026-03-27',
    'total_assets': '3029338947539.67',
    'id': 20,
    'upload_date': '2026-03-27T16:48:49.754193+07:00'
}
```

### Portfolio Summary
```
{
    'total_assets': 3029338947539.67,
    'asset_count': 99,
    'deposito_count': 22,
    'bond_count': 77,
    'last_updated': '2026-03-27T16:48:49.754193+07:00'
}
```

### Data Parsed Successfully
- **22 Deposito records** (Total: 377.8B IDR)
- **93 Bond records** → Creates 77 bond maturity + 888 bond coupon records
- **Total Portfolio Value**: 3.03T IDR
- **Maturity Calendar**: 965 total items

## How to Use

1. **Start the application**:
   ```batch
   cd "E:\Backup C\Development Apps\liquidity -aset-app 2"
   .\start.bat
   ```

2. **Open the frontend**: http://localhost:3000

3. **Navigate to Maturity Profile tab**

4. **Upload the portfolio file**:
   - Click "Upload Portfolio Data"
   - Select `Data Portfolio Asset BP 27022026.xlsx`
   - Check "Clear previous portfolio data before upload" (to avoid duplicates)
   - Click Upload

5. **View the data**:
   - Switch between "Profile View" (chart) and "Calendar View" (table)
   - Filter by Year, Sub Fund, Management Type, and Asset Type
   - Adjust number scale for better readability

## Files Modified

- `backend/app/routers/portfolio.py` - Main fix for column name handling

## Verification

Run the test script to verify the fix:
```batch
cd backend
venv\Scripts\python.exe test_portfolio_upload.py
```

Expected output:
```
✅ Upload successful!
✅ Test completed!
```

## Notes

- The fix maintains backward compatibility with both column naming conventions
- The code now handles: `MaturityDate` / `Maturity Date`, `DepositAmount` / `Amount`, `Balance` / `BalanceAmount`, etc.
- Sheet name detection already supported both `Depo`/`Deposito` and `Bond`/`Obligasi`
