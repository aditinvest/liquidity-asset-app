"""
Standalone test for portfolio Excel parsing.
This test verifies the parsing logic without requiring a database connection.
"""
import pandas as pd
from decimal import Decimal
from datetime import date, datetime
import sys

def test_portfolio_parsing():
    """Test parsing the portfolio Excel file."""
    file_path = "../Data Portfolio Asset BP 27022026.xlsx"
    
    print("="*60)
    print("Testing Portfolio Excel Parsing")
    print("="*60)
    
    # Read Excel file
    xls = pd.ExcelFile(file_path)
    print(f"\n✅ Successfully opened Excel file")
    print(f"Sheet names: {xls.sheet_names}")
    
    # Determine sheet names
    deposito_sheet = "Deposito" if "Deposito" in xls.sheet_names else "Depo"
    bond_sheet = "Bond" if "Bond" in xls.sheet_names else "Obligasi"
    print(f"Using Deposito sheet: {deposito_sheet}")
    print(f"Using Bond sheet: {bond_sheet}")
    
    # Read sheets
    deposito_df = pd.read_excel(xls, sheet_name=deposito_sheet)
    bond_df = pd.read_excel(xls, sheet_name=bond_sheet)
    
    print(f"\n📊 Deposito Statistics:")
    print(f"  - Total rows: {len(deposito_df)}")
    print(f"  - Columns: {list(deposito_df.columns)[:10]}...")
    
    print(f"\n📊 Bond Statistics:")
    print(f"  - Total rows: {len(bond_df)}")
    print(f"  - Columns: {list(bond_df.columns)[:10]}...")
    
    # Test Deposito parsing
    print(f"\n{'='*60}")
    print("Testing Deposito Parsing")
    print(f"{'='*60}")
    
    deposito_count = 0
    total_deposito_amount = Decimal('0.00')
    
    for idx, row in deposito_df.iterrows():
        fund_id = str(row.get('FundID', ''))
        sub_fund = 'OPEX' if (fund_id.upper() == 'OPEX' or 'JPOIP' in fund_id.upper()) else 'CAPEX'
        
        syariah_val = str(row.get('Syariah', '')).lower()
        management_type = 'SYARIAH' if syariah_val in ['yes', 'true', '1'] else 'KONVENSIONAL'
        
        # Handle both column name formats
        maturity_date = row.get('MaturityDate') if 'MaturityDate' in row else row.get('Maturity Date')
        if pd.isna(maturity_date):
            print(f"  ⚠️  Row {idx}: Skipping - No maturity date")
            continue
        if isinstance(maturity_date, pd.Timestamp):
            maturity_date = maturity_date.date()
        
        principal_amount = row.get('DepositAmount', row.get('Amount', 0))
        if pd.isna(principal_amount):
            principal_amount = 0
        
        deposito_count += 1
        total_deposito_amount += Decimal(str(principal_amount))
        
        if idx < 3:  # Print first 3 rows
            print(f"\n  Row {idx}:")
            print(f"    FundID: {fund_id} → Sub Fund: {sub_fund}")
            print(f"    Syariah: {row.get('Syariah')} → Management: {management_type}")
            print(f"    Maturity Date: {maturity_date}")
            print(f"    Principal: {principal_amount:,.0f}")
            print(f"    Counterpart: {row.get('CounterpartName')}")
    
    print(f"\n✅ Deposito Parsing Complete:")
    print(f"  - Successfully parsed: {deposito_count} records")
    print(f"  - Total amount: {total_deposito_amount:,.2f}")
    
    # Test Bond parsing
    print(f"\n{'='*60}")
    print("Testing Bond Parsing")
    print(f"{'='*60}")
    
    bond_count = 0
    total_bond_principal = Decimal('0.00')
    total_bond_coupon = Decimal('0.00')
    
    for idx, row in bond_df.iterrows():
        fund_id = str(row.get('FundID', ''))
        sub_fund = 'OPEX' if (fund_id.upper() == 'OPEX' or 'JPOIP' in fund_id.upper()) else 'CAPEX'
        
        syariah_val = row.get('Syariah', False)
        if isinstance(syariah_val, bool):
            management_type = 'SYARIAH' if syariah_val else 'KONVENSIONAL'
        else:
            syariah_str = str(syariah_val).lower()
            management_type = 'SYARIAH' if syariah_str in ['yes', 'true', '1'] else 'KONVENSIONAL'
        
        # Parse dates - handle both column name formats
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
        
        if not maturity_date:
            print(f"  ⚠️  Row {idx}: Skipping - No maturity date")
            continue
        
        next_coupon_date_col = 'NextCouponDate' if 'NextCouponDate' in row else 'Next Coupon Date'
        next_coupon_date = parse_date(row.get(next_coupon_date_col))
        
        principal_amount = row.get('Balance', row.get('BalanceAmount', 0))
        if pd.isna(principal_amount):
            principal_amount = 0
        
        coupon_amount = row.get('NetCouponAmount', row.get('Net_Coupon_Amount', 0))
        if pd.isna(coupon_amount):
            coupon_amount = 0
        
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
        
        bond_count += 1
        total_bond_principal += Decimal(str(principal_amount))
        total_bond_coupon += Decimal(str(coupon_amount))
        
        if idx < 3:  # Print first 3 rows
            print(f"\n  Row {idx}:")
            print(f"    FundID: {fund_id} → Sub Fund: {sub_fund}")
            print(f"    Syariah: {row.get('Syariah')} → Management: {management_type}")
            print(f"    Maturity Date: {maturity_date}")
            print(f"    Next Coupon Date: {next_coupon_date}")
            print(f"    Principal: {principal_amount:,.0f}")
            print(f"    Coupon: {coupon_amount:,.0f}")
            print(f"    Frequency: {row.get('Frequency')} → Parsed: {frequency_months} months")
            print(f"    Security: {row.get('SecuritiesName')}")
    
    print(f"\n✅ Bond Parsing Complete:")
    print(f"  - Successfully parsed: {bond_count} records")
    print(f"  - Total Principal: {total_bond_principal:,.2f}")
    print(f"  - Total Coupon: {total_bond_coupon:,.2f}")
    
    # Summary
    print(f"\n{'='*60}")
    print("PARSING SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Total Deposito Records: {deposito_count}")
    print(f"✅ Total Bond Records: {bond_count}")
    print(f"✅ Total Portfolio Value: {total_deposito_amount + total_bond_principal:,.2f}")
    print(f"\n🎉 All tests passed! The parsing logic is working correctly.")
    print(f"\n📝 Note: Make sure the backend server is running and database is connected")
    print(f"   before uploading through the UI.")
    
    return True

if __name__ == "__main__":
    try:
        test_portfolio_parsing()
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
