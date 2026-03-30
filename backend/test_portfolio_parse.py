import pandas as pd
from io import BytesIO
from decimal import Decimal
from datetime import date, datetime

# Read Excel file
file_path = '../Data Portfolio Asset BP 27022026.xlsx'
xls = pd.ExcelFile(file_path)

print("Sheet names:", xls.sheet_names)
print("\n" + "="*50 + "\n")

# Determine sheet names
deposito_sheet = "Deposito" if "Deposito" in xls.sheet_names else "Depo"
bond_sheet = "Bond" if "Bond" in xls.sheet_names else "Obligasi"

print(f"Using sheet: {deposito_sheet} for Deposito")
print(f"Using sheet: {bond_sheet} for Bond")
print("\n" + "="*50 + "\n")

# Read Deposito sheet
df_deposito = pd.read_excel(xls, sheet_name=deposito_sheet)
print(f"Deposito columns: {list(df_deposito.columns)}")
print(f"Deposito rows: {len(df_deposito)}")
print("\nFirst 2 Deposito rows:")
for idx, row in df_deposito.head(2).iterrows():
    print(f"\nRow {idx}:")
    fund_id = str(row.get('FundID', ''))
    sub_fund = 'OPEX' if (fund_id.upper() == 'OPEX' or 'JPOIP' in fund_id.upper()) else 'CAPEX'
    
    syariah_val = str(row.get('Syariah', '')).lower()
    management_type = 'SYARIAH' if syariah_val in ['yes', 'true', '1'] else 'KONVENSIONAL'
    
    maturity_date = row.get('MaturityDate') if 'MaturityDate' in row else row.get('Maturity Date')
    if pd.notna(maturity_date) and isinstance(maturity_date, pd.Timestamp):
        maturity_date = maturity_date.date()
    
    principal_amount = row.get('DepositAmount', row.get('Amount', 0))
    
    print(f"  FundID: {fund_id} -> Sub Fund: {sub_fund}")
    print(f"  Syariah: {row.get('Syariah')} -> Management: {management_type}")
    print(f"  MaturityDate: {maturity_date}")
    print(f"  Principal: {principal_amount}")
    print(f"  CounterpartID: {row.get('CounterpartID')}")
    print(f"  CounterpartName: {row.get('CounterpartName')}")

print("\n" + "="*50 + "\n")

# Read Bond sheet
df_bond = pd.read_excel(xls, sheet_name=bond_sheet)
print(f"Bond columns: {list(df_bond.columns)}")
print(f"Bond rows: {len(df_bond)}")
print("\nFirst 2 Bond rows:")
for idx, row in df_bond.head(2).iterrows():
    print(f"\nRow {idx}:")
    fund_id = str(row.get('FundID', ''))
    sub_fund = 'OPEX' if (fund_id.upper() == 'OPEX' or 'JPOIP' in fund_id.upper()) else 'CAPEX'
    
    syariah_val = row.get('Syariah', False)
    if isinstance(syariah_val, bool):
        management_type = 'SYARIAH' if syariah_val else 'KONVENSIONAL'
    else:
        syariah_str = str(syariah_val).lower()
        management_type = 'SYARIAH' if syariah_str in ['yes', 'true', '1'] else 'KONVENSIONAL'
    
    # Parse dates
    def parse_date(val):
        if pd.isna(val):
            return None
        if isinstance(val, pd.Timestamp):
            return val.date()
        if isinstance(val, datetime):
            return val.date()
        if isinstance(val, date):
            return val
        return None
    
    maturity_date_col = 'MaturityDate' if 'MaturityDate' in row else 'Maturity Date'
    maturity_date = parse_date(row.get(maturity_date_col))
    
    next_coupon_date_col = 'NextCouponDate' if 'NextCouponDate' in row else 'Next Coupon Date'
    next_coupon_date = parse_date(row.get(next_coupon_date_col))
    
    principal_amount = row.get('Balance', row.get('BalanceAmount', 0))
    coupon_amount = row.get('NetCouponAmount', row.get('Net_Coupon_Amount', 0))
    
    # Parse frequency
    frequency_months = row.get('Frequency', 0)
    if pd.isna(frequency_months):
        frequency_months = 0
    if isinstance(frequency_months, str):
        import re
        match = re.search(r'\d+', str(frequency_months))
        frequency_months = int(match.group()) if match else 0
    elif isinstance(frequency_months, (int, float)):
        frequency_months = int(frequency_months) if frequency_months else 0
    
    print(f"  FundID: {fund_id} -> Sub Fund: {sub_fund}")
    print(f"  Syariah: {row.get('Syariah')} -> Management: {management_type}")
    print(f"  MaturityDate: {maturity_date}")
    print(f"  NextCouponDate: {next_coupon_date}")
    print(f"  Principal (Balance): {principal_amount}")
    print(f"  Coupon (NetCouponAmount): {coupon_amount}")
    print(f"  Frequency: {row.get('Frequency')} -> Parsed: {frequency_months}")
    print(f"  SecuritiesID: {row.get('SecuritiesID')}")
    print(f"  SecuritiesName: {row.get('SecuritiesName')}")

print("\n" + "="*50 + "\n")
print("✅ Parsing test completed successfully!")
