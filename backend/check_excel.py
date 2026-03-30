import sys
sys.path.insert(0, '.')

from app.services.excel_parser import parse_projection_excel
import pandas as pd

excel_path = r'E:\Backup C\Development Apps\liquidity -aset-app 2\Data CF Projection Asset BP 27022026.xlsx'

# Read the Excel file directly
xls = pd.ExcelFile(excel_path)
print("Sheets:", xls.sheet_names)

# Read Depo sheet
df = pd.read_excel(xls, sheet_name='Depo')
print("\n=== Depo Sheet ===")
print("Columns:", df.columns.tolist())
print("\nAll rows:")
for idx, row in df.iterrows():
    fund_id = str(row.get('FundID', ''))
    sub_fund = "OPEX" if "JPOIP" in fund_id.upper() or fund_id.upper() == "OPEX" else "CAPEX"
    syariah = str(row.get('Syariah', '')).upper()
    mgmt = "SYARIAH" if syariah in ['YES', 'TRUE', 'Y'] else "KONVENSIONAL"
    maturity = row.get('MaturityDate', row.get('Maturity Date'))
    amount = row.get('DepositAmount', 0)
    
    print(f"  {fund_id} | {row.get('CounterpartID')} | {maturity} | {amount} | Syariah={row.get('Syariah')} -> {sub_fund} / {mgmt}")

# Filter for March 11
print("\n=== March 11, 2026 entries ===")
march_11 = df[df['MaturityDate'].astype(str).str.contains('2026-03-11', na=False)]
for idx, row in march_11.iterrows():
    fund_id = str(row.get('FundID', ''))
    sub_fund = "OPEX" if "JPOIP" in fund_id.upper() or fund_id.upper() == "OPEX" else "CAPEX"
    print(f"  FundID: {fund_id} -> Sub Fund: {sub_fund}")
    print(f"  Amount: {row.get('DepositAmount')}")
    print(f"  Syariah: {row.get('Syariah')}")
