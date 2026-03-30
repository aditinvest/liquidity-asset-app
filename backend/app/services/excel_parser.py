import pandas as pd
from decimal import Decimal
from typing import List, Dict, Any
from datetime import datetime
import re


def parse_projection_excel(file_path: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Parse projection Excel file with Deposito and Bond sheets.
    Returns processed data ready for database insertion.
    """
    # Read Excel file
    xls = pd.ExcelFile(file_path)

    results = {
        'deposito': [],
        'bond': []
    }

    # Process Deposito sheet (handle both "Deposito" and "Depo" sheet names)
    deposito_sheet = 'Deposito' if 'Deposito' in xls.sheet_names else 'Depo' if 'Depo' in xls.sheet_names else None
    if deposito_sheet:
        df_deposito = pd.read_excel(xls, sheet_name=deposito_sheet)
        for _, row in df_deposito.iterrows():
            # Determine OPEX/CAPEX
            fund_id = str(row.get('FundID', '')).upper()
            sub_fund = "OPEX" if ("JPOIP" in fund_id or fund_id == "OPEX") else "CAPEX"

            # Determine Syariah/Conventional
            syariah_value = row.get('Syariah', '')
            management_type = "SYARIAH" if str(syariah_value).upper() in ['YES', 'TRUE', 'Y', '1'] else "KONVENSIONAL"

            # Handle column name variations (MaturityDate vs Maturity Date)
            maturity_date = row.get('Maturity Date') if 'Maturity Date' in row else row.get('MaturityDate')
            counterparty_name = row.get('CounterpartName') if 'CounterpartName' in row else row.get('Counterpart_Name')

            results['deposito'].append({
                'sub_fund': sub_fund,
                'management_type': management_type,
                'instrument_type': 'DEPOSITO',
                'fund_id': fund_id,
                'instrument_code': str(row.get('CounterpartID', '')),
                'instrument_name': str(counterparty_name if counterparty_name is not None else ''),
                'transaction_date': pd.to_datetime(maturity_date).date() if pd.notna(maturity_date) else None,
                'amount': Decimal(str(row.get('DepositAmount', 0))) if pd.notna(row.get('DepositAmount')) else Decimal('0.00')
            })
    
    # Process Bond sheet (handle column name variations)
    if 'Bond' in xls.sheet_names:
        df_bond = pd.read_excel(xls, sheet_name='Bond')
        for _, row in df_bond.iterrows():
            # Determine OPEX/CAPEX
            fund_id = str(row.get('FundID', '')).upper()
            sub_fund = "OPEX" if ("JPOIP" in fund_id or fund_id == "OPEX") else "CAPEX"

            # Determine Syariah/Conventional (Bond uses TRUE/FALSE)
            syariah_value = row.get('Syariah', False)
            management_type = "SYARIAH" if str(syariah_value).upper() in ['YES', 'TRUE', 'Y', '1'] else "KONVENSIONAL"

            # Handle column name variations
            next_coupon_date = row.get('NextCouponDate') if 'NextCouponDate' in row else row.get('Next_Coupon_Date')
            net_coupon_amount = row.get('NetCouponAmount') if 'NetCouponAmount' in row else row.get('Net_Coupon_Amount')
            maturity_date = row.get('Maturity Date') if 'Maturity Date' in row else row.get('MaturityDate')
            balance = row.get('Balance') if 'Balance' in row else row.get('BalanceAmount')
            securities_name = row.get('SecuritiesName') if 'SecuritiesName' in row else row.get('Securities_Name')
            securities_id = row.get('SecuritiesID') if 'SecuritiesID' in row else row.get('Securities_ID')

            # Create Coupon record
            coupon_date = pd.to_datetime(next_coupon_date).date() if pd.notna(next_coupon_date) else None
            coupon_amount = Decimal(str(net_coupon_amount)) if pd.notna(net_coupon_amount) else Decimal('0.00')

            results['bond'].append({
                'sub_fund': sub_fund,
                'management_type': management_type,
                'instrument_type': 'BOND_COUPON',
                'fund_id': fund_id,
                'instrument_code': str(securities_id if securities_id is not None else ''),
                'instrument_name': str(securities_name if securities_name is not None else ''),
                'transaction_date': coupon_date,
                'amount': coupon_amount
            })

            # Create Maturity record
            maturity_date_val = pd.to_datetime(maturity_date).date() if pd.notna(maturity_date) else None
            balance_amount = Decimal(str(balance)) if pd.notna(balance) else Decimal('0.00')

            results['bond'].append({
                'sub_fund': sub_fund,
                'management_type': management_type,
                'instrument_type': 'BOND_MATURITY',
                'fund_id': fund_id,
                'instrument_code': str(securities_id if securities_id is not None else ''),
                'instrument_name': str(securities_name if securities_name is not None else ''),
                'transaction_date': maturity_date_val,
                'amount': balance_amount
            })
    
    return results


def parse_realization_excel(file_path: str) -> List[Dict[str, Any]]:
    """
    Parse realization Excel file with Depo and Bond sheets.
    Returns processed data ready for database insertion.
    """
    xls = pd.ExcelFile(file_path)
    results = []

    # Process Depo sheet
    if 'Depo' in xls.sheet_names:
        df_deposito = pd.read_excel(xls, sheet_name='Depo')
        for _, row in df_deposito.iterrows():
            # Determine OPEX/CAPEX
            fund_id = str(row.get('FundID', '')).upper()
            sub_fund = "OPEX" if ("JPOIP" in fund_id or fund_id == "OPEX") else "CAPEX"

            # Determine Syariah/Conventional
            syariah_value = row.get('Syariah', '')
            management_type = "SYARIAH" if str(syariah_value).upper() in ['YES', 'TRUE', 'Y', '1'] else "KONVENSIONAL"

            # Determine transaction category from TrxType and Description
            transaction_category = get_deposito_transaction_category(row)

            # Get amount
            amount = get_amount_from_row(row)

            # Get transaction date
            transaction_date = get_transaction_date(row)

            # Get instrument name
            instrument_name = str(row.get('CounterpartName', ''))

            results.append({
                'sub_fund': sub_fund,
                'management_type': management_type,
                'transaction_category': transaction_category,
                'fund_id': fund_id,
                'instrument_name': instrument_name,
                'transaction_date': transaction_date,
                'proceed_amount': amount
            })

    # Process Bond sheet
    if 'Bond' in xls.sheet_names:
        df_bond = pd.read_excel(xls, sheet_name='Bond')
        for _, row in df_bond.iterrows():
            # Determine OPEX/CAPEX
            fund_id = str(row.get('FundID', '')).upper()
            sub_fund = "OPEX" if ("JPOIP" in fund_id or fund_id == "OPEX") else "CAPEX"

            # Determine Syariah/Conventional (Bond uses TRUE/FALSE)
            syariah_value = row.get('Syariah', False)
            management_type = "SYARIAH" if str(syariah_value).upper() in ['YES', 'TRUE', 'Y', '1'] else "KONVENSIONAL"

            # Determine transaction category from TrxType and Description
            transaction_category = get_bond_transaction_category(row)

            # Get amount - use ProceedAmount
            amount = Decimal(str(row.get('ProceedAmount', 0))) if pd.notna(row.get('ProceedAmount')) else Decimal('0.00')

            # Get transaction date
            transaction_date = get_transaction_date(row)

            # Get instrument name - use BondName or CounterpartName
            instrument_name = str(row.get('BondName', row.get('CounterpartName', '')))

            results.append({
                'sub_fund': sub_fund,
                'management_type': management_type,
                'transaction_category': transaction_category,
                'fund_id': fund_id,
                'instrument_name': instrument_name,
                'transaction_date': transaction_date,
                'proceed_amount': amount
            })

    return results


def get_deposito_transaction_category(row: pd.Series) -> str:
    """Determine transaction category for Deposito based on TrxType and Description."""
    # First check TrxType column
    trx_type = str(row.get('TrxType', '')).lower()
    description = str(row.get('Description', '')).lower()

    # Check TrxType patterns
    if 'disburse' in trx_type or 'cair' in trx_type or 'pencairan' in description:
        return 'Deposit Disbursement'
    elif 'deposit' in trx_type or 'placement' in trx_type or 'penempatan' in description or 'baru' in description:
        return 'Deposit Placement'
    elif 'matur' in trx_type or 'jatuh tempo' in description or 'matured' in description:
        return 'Deposit Maturity'
    elif 'roll' in trx_type or 'perpanjangan' in description:
        return 'Deposit Rollover'
    elif 'interest' in trx_type or 'bunga' in description or 'coupon' in description:
        return 'Deposit Interest'
    elif 'tax' in trx_type or 'pajak' in description:
        return 'Deposit Tax'

    # Default to General Transaction
    return 'General Transaction'


def get_bond_transaction_category(row: pd.Series) -> str:
    """Determine transaction category for Bond based on TrxType and Description."""
    # Check Description column first (most reliable)
    description = str(row.get('Description', '')).lower()

    # Map Indonesian descriptions to English categories
    if 'kupon obligasi' in description or 'bunga obligasi' in description:
        return 'Bond Coupon'
    elif 'pembelian obligasi' in description or 'beli obligasi' in description:
        return 'Bond Acquisition'
    elif 'penjualan obligasi' in description or 'jual obligasi' in description:
        return 'Bond Maturity'
    elif 'jatuh tempo obligasi' in description or 'matur' in description:
        return 'Bond Maturity'

    # Fallback to TrxType column
    trx_type = str(row.get('TrxType', '')).lower()
    buy_sell = str(row.get('BuySell', '')).lower()

    # Check TrxType patterns
    if 'matur' in trx_type or 'matured' in trx_type:
        return 'Bond Maturity'
    elif 'purchase' in trx_type or 'buy' in trx_type:
        return 'Bond Acquisition'
    elif 'sale' in trx_type or 'sell' in trx_type:
        return 'Bond Maturity'
    elif 'coupon' in trx_type or 'interest' in trx_type:
        return 'Bond Coupon'

    # Check BuySell column
    if 'buy' in buy_sell or 'beli' in buy_sell:
        return 'Bond Acquisition'
    elif 'sell' in buy_sell or 'jual' in buy_sell:
        return 'Bond Maturity'

    # Default to General Transaction
    return 'General Transaction'


def get_amount_from_row(row: pd.Series) -> Decimal:
    """Extract amount from row based on common column names."""
    amount_columns = ['ProceedAmount', 'Amount', 'Nominal', 'DepositAmount', 
                      'NetCouponAmount', 'Balance', 'Pencairan', 'Penempatan']
    
    for col in amount_columns:
        for actual_col in row.index:
            if col.lower() in actual_col.lower():
                val = row[actual_col]
                if pd.notna(val):
                    return Decimal(str(val))
    
    return Decimal('0.00')


def get_transaction_date(row: pd.Series) -> datetime.date:
    """Extract transaction date from row."""
    date_columns = ['TrxDate', 'TransactionDate', 'Transaction Date', 'Date', 'MaturityDate', 
                    'Maturity Date', 'NextCouponDate', 'Tanggal', 'EffectiveDate']

    for col in date_columns:
        for actual_col in row.index:
            if col.lower() in actual_col.lower() or actual_col.lower() in col.lower():
                val = row[actual_col]
                if pd.notna(val):
                    try:
                        return pd.to_datetime(val).date()
                    except:
                        pass

    return datetime.now().date()


def validate_projection_columns(df: pd.DataFrame, sheet_name: str) -> Dict[str, Any]:
    """Validate required columns in projection file."""
    required_columns = {
        'Deposito': ['FundID', 'CounterpartID', 'CounterpartName', 'Maturity Date', 'DepositAmount', 'Syariah'],
        'Bond': ['FundID', 'SecuritiesID', 'SecuritiesName', 'NextCouponDate', 'NetCouponAmount', 'Maturity Date', 'Balance', 'Syariah']
    }
    
    if sheet_name not in required_columns:
        return {'valid': False, 'error': f'Unknown sheet: {sheet_name}'}
    
    missing = [col for col in required_columns[sheet_name] if col not in df.columns]
    
    if missing:
        return {'valid': False, 'error': f'Missing columns: {", ".join(missing)}'}
    
    return {'valid': True}
