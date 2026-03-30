from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, union_all
from typing import Optional, List, Set, Tuple, Dict
from datetime import date
from decimal import Decimal

from ..database import get_db
from ..models.models import CFProjection, ManualInput
from ..schemas.schemas import ProjectionReportSummary, ProjectionReportItem

router = APIRouter()


@router.get("/report", response_model=ProjectionReportSummary)
async def get_projection_report(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020),
    sub_fund: Optional[str] = Query(None, pattern="^(OPEX|CAPEX)$"),
    management_type: Optional[str] = Query(None, pattern="^(SYARIAH|KONVENSIONAL)$"),
    db: Session = Depends(get_db)
):
    """
    Get cash flow projection report grouped by date.
    Returns opening balance, CF In (Deposito, Bond Coupon, Bond Maturity), CF Out, and ending balance.
    """

    # Build query filters for projections
    projection_filters = [
        extract('month', CFProjection.transaction_date) == month,
        extract('year', CFProjection.transaction_date) == year
    ]

    if sub_fund:
        projection_filters.append(CFProjection.sub_fund == sub_fund)

    if management_type:
        projection_filters.append(CFProjection.management_type == management_type)

    # Get projection data grouped by date
    projection_data = db.query(
        CFProjection.transaction_date,
        CFProjection.sub_fund,
        CFProjection.management_type,
        func.sum(CFProjection.amount).filter(CFProjection.instrument_type == 'DEPOSITO').label('deposito_in'),
        func.sum(CFProjection.amount).filter(CFProjection.instrument_type == 'BOND_COUPON').label('bond_coupon_in'),
        func.sum(CFProjection.amount).filter(CFProjection.instrument_type == 'BOND_MATURITY').label('bond_maturity_in')
    ).filter(*projection_filters).group_by(
        CFProjection.transaction_date,
        CFProjection.sub_fund,
        CFProjection.management_type
    ).all()

    # Get CF Out (manual inputs) for the same period
    cf_out_filters = [
        extract('month', ManualInput.transaction_date) == month,
        extract('year', ManualInput.transaction_date) == year,
        ManualInput.input_type == 'CF_OUT'
    ]

    if sub_fund:
        cf_out_filters.append(ManualInput.sub_fund == sub_fund)

    if management_type:
        cf_out_filters.append(ManualInput.management_type == management_type)

    cf_out_data = db.query(
        ManualInput.transaction_date,
        ManualInput.sub_fund,
        ManualInput.management_type,
        func.sum(ManualInput.amount).label('cf_out')
    ).filter(*cf_out_filters).group_by(
        ManualInput.transaction_date,
        ManualInput.sub_fund,
        ManualInput.management_type
    ).all()

    # Get Opening Balance (Saldo Awal) - use the earliest date or previous month ending
    saldo_awal_filters = [
        ManualInput.input_type == 'SALDO_AWAL'
    ]

    if sub_fund:
        saldo_awal_filters.append(ManualInput.sub_fund == sub_fund)

    if management_type:
        saldo_awal_filters.append(ManualInput.management_type == management_type)

    # Get the most recent opening balance before or at the start of the month
    month_start = date(year, month, 1)
    saldo_awal_filters.append(ManualInput.transaction_date <= month_start)

    saldo_awal_data = db.query(
        ManualInput.sub_fund,
        ManualInput.management_type,
        func.max(ManualInput.transaction_date).label('latest_date'),
        func.sum(ManualInput.amount).label('opening_balance')
    ).filter(*saldo_awal_filters).group_by(
        ManualInput.sub_fund,
        ManualInput.management_type
    ).all()

    # Create lookup for CF Out
    cf_out_lookup = {}
    for row in cf_out_data:
        key = (row.transaction_date, row.sub_fund, row.management_type)
        cf_out_lookup[key] = row.cf_out or Decimal('0.00')

    # Create lookup for Opening Balance
    opening_balance_lookup = {}
    for row in saldo_awal_data:
        key = (row.sub_fund, row.management_type)
        opening_balance_lookup[key] = row.opening_balance or Decimal('0.00')

    # Collect all unique (date, sub_fund, management_type) keys from both projections and CF Out
    all_keys: Set[Tuple[date, str, str]] = set()
    projection_lookup = {}

    for row in projection_data:
        key = (row.transaction_date, row.sub_fund, row.management_type)
        all_keys.add(key)
        projection_lookup[key] = {
            'deposito_in': row.deposito_in or Decimal('0.00'),
            'bond_coupon_in': row.bond_coupon_in or Decimal('0.00'),
            'bond_maturity_in': row.bond_maturity_in or Decimal('0.00')
        }

    # Also add CF Out keys that might not have projection data
    for row in cf_out_data:
        key = (row.transaction_date, row.sub_fund, row.management_type)
        all_keys.add(key)

    # Build report items
    report_items = []
    total_opening = Decimal('0.00')
    total_cf_in = Decimal('0.00')
    total_cf_out = Decimal('0.00')
    total_ending = Decimal('0.00')

    # Track which opening balances have been counted
    counted_opening_keys: Set[Tuple[str, str]] = set()

    # If management_type is None (All), we need to group by date only and sum Conventional + Syariah
    if management_type is None:
        # Group keys by (sub_fund, date) and sum all management types
        grouped_by_date: Dict[Tuple[str, date], Dict[str, Any]] = {}
        
        for key in all_keys:
            transaction_date, sub_fund_val, mgmt_type = key
            group_key = (sub_fund_val, transaction_date)
            
            if group_key not in grouped_by_date:
                grouped_by_date[group_key] = {
                    'deposito_in': Decimal('0.00'),
                    'bond_coupon_in': Decimal('0.00'),
                    'bond_maturity_in': Decimal('0.00'),
                    'cf_out': Decimal('0.00')
                }
            
            proj = projection_lookup.get(key, {
                'deposito_in': Decimal('0.00'),
                'bond_coupon_in': Decimal('0.00'),
                'bond_maturity_in': Decimal('0.00')
            })
            
            grouped_by_date[group_key]['deposito_in'] += proj['deposito_in']
            grouped_by_date[group_key]['bond_coupon_in'] += proj['bond_coupon_in']
            grouped_by_date[group_key]['bond_maturity_in'] += proj['bond_maturity_in']
            grouped_by_date[group_key]['cf_out'] += cf_out_lookup.get(key, Decimal('0.00'))
        
        # Sort by date
        sorted_dates = sorted(grouped_by_date.keys(), key=lambda x: x[1])
        
        # Track running balance per sub_fund
        running_balance_by_subfund: Dict[str, Decimal] = {}
        
        for group_key in sorted_dates:
            sub_fund_val, transaction_date = group_key
            data = grouped_by_date[group_key]
            
            # Get combined opening balance from all management types for this sub_fund
            if sub_fund_val not in running_balance_by_subfund:
                # First entry - sum all Saldo Awal for this sub_fund
                opening_balance = Decimal('0.00')
                for mgmt_type in ['SYARIAH', 'KONVENSIONAL']:
                    opening_balance += opening_balance_lookup.get((sub_fund_val, mgmt_type), Decimal('0.00'))
            else:
                opening_balance = running_balance_by_subfund[sub_fund_val]
            
            deposito_in = data['deposito_in']
            bond_coupon_in = data['bond_coupon_in']
            bond_maturity_in = data['bond_maturity_in']
            cf_out = data['cf_out']
            
            total_in = deposito_in + bond_coupon_in + bond_maturity_in
            net_cashflow = total_in - cf_out
            ending_balance = opening_balance + net_cashflow
            
            # Update running balance
            running_balance_by_subfund[sub_fund_val] = ending_balance
            
            report_items.append(ProjectionReportItem(
                date=transaction_date,
                sub_fund=sub_fund_val,
                management_type='ALL',  # Mark as "All"
                deposito_in=deposito_in,
                bond_coupon_in=bond_coupon_in,
                bond_maturity_in=bond_maturity_in,
                cf_out=cf_out,
                total_in=total_in,
                net_cashflow=net_cashflow,
                opening_balance=opening_balance,
                ending_balance=ending_balance
            ))
            
            # Count opening balance once per sub_fund
            if sub_fund_val not in [k[0] for k in counted_opening_keys]:
                total_opening += opening_balance
                counted_opening_keys.add((sub_fund_val, 'ALL'))
            
            total_cf_in += total_in
            total_cf_out += cf_out
            total_ending += ending_balance
    else:
        # Original logic for specific management type
        # Group keys by (sub_fund, management_type) and sort by date
        grouped_keys: Dict[Tuple[str, str], List[Tuple[date, str, str]]] = {}
        for key in all_keys:
            transaction_date, sub_fund_val, mgmt_type = key
            group_key = (sub_fund_val, mgmt_type)
            if group_key not in grouped_keys:
                grouped_keys[group_key] = []
            grouped_keys[group_key].append(key)

        # Sort each group by date
        for group_key in grouped_keys:
            grouped_keys[group_key].sort(key=lambda x: x[0])

        # Track running balance per (sub_fund, management_type)
        running_balance: Dict[Tuple[str, str], Decimal] = {}

        # Process each group in order
        for group_key in sorted(grouped_keys.keys()):
            keys_list = grouped_keys[group_key]

            for key in keys_list:
                transaction_date, sub_fund_val, mgmt_type = key
                opening_key = (sub_fund_val, mgmt_type)

                proj = projection_lookup.get(key, {
                    'deposito_in': Decimal('0.00'),
                    'bond_coupon_in': Decimal('0.00'),
                    'bond_maturity_in': Decimal('0.00')
                })

                deposito_in = proj['deposito_in']
                bond_coupon_in = proj['bond_coupon_in']
                bond_maturity_in = proj['bond_maturity_in']
                cf_out = cf_out_lookup.get(key, Decimal('0.00'))

                # Get opening balance: use Saldo Awal for first date, otherwise use previous ending balance
                if opening_key not in running_balance:
                    # First entry for this group - use Saldo Awal
                    opening_balance = opening_balance_lookup.get(opening_key, Decimal('0.00'))
                else:
                    # Use previous ending balance as opening balance
                    opening_balance = running_balance[opening_key]

                total_in = deposito_in + bond_coupon_in + bond_maturity_in
                net_cashflow = total_in - cf_out
                ending_balance = opening_balance + net_cashflow

                # Update running balance
                running_balance[opening_key] = ending_balance

                report_items.append(ProjectionReportItem(
                    date=transaction_date,
                    sub_fund=sub_fund_val,
                    management_type=mgmt_type,
                    deposito_in=deposito_in,
                    bond_coupon_in=bond_coupon_in,
                    bond_maturity_in=bond_maturity_in,
                    cf_out=cf_out,
                    total_in=total_in,
                    net_cashflow=net_cashflow,
                    opening_balance=opening_balance,
                    ending_balance=ending_balance
                ))

                # Only count opening balance once per (sub_fund, management_type)
                if opening_key not in counted_opening_keys:
                    total_opening += opening_balance
                    counted_opening_keys.add(opening_key)

                total_cf_in += total_in
                total_cf_out += cf_out
                total_ending += ending_balance

    # Sort by date
    report_items.sort(key=lambda x: x.date)

    return ProjectionReportSummary(
        month=month,
        year=year,
        sub_fund=sub_fund,
        management_type=management_type,
        total_opening_balance=total_opening,
        total_cf_in=total_cf_in,
        total_cf_out=total_cf_out,
        total_ending_balance=total_ending,
        data=report_items
    )


@router.get("/summary")
async def get_projection_summary(
    sub_fund: Optional[str] = Query(None, pattern="^(OPEX|CAPEX)$"),
    management_type: Optional[str] = Query(None, pattern="^(SYARIAH|KONVENSIONAL)$"),
    db: Session = Depends(get_db)
):
    """Get summary of projection data by sub-fund and management type."""
    
    filters = []
    
    if sub_fund:
        filters.append(CFProjection.sub_fund == sub_fund)
    
    if management_type:
        filters.append(CFProjection.management_type == management_type)
    
    query = db.query(
        CFProjection.sub_fund,
        CFProjection.management_type,
        CFProjection.instrument_type,
        func.sum(CFProjection.amount).label('total_amount'),
        func.count(CFProjection.id).label('record_count')
    )
    
    if filters:
        query = query.filter(*filters)
    
    results = query.group_by(
        CFProjection.sub_fund,
        CFProjection.management_type,
        CFProjection.instrument_type
    ).all()
    
    summary = {
        'OPEX': {'SYARIAH': {}, 'KONVENSIONAL': {}},
        'CAPEX': {'SYARIAH': {}, 'KONVENSIONAL': {}}
    }
    
    for row in results:
        summary[row.sub_fund][row.management_type][row.instrument_type] = {
            'total_amount': float(row.total_amount),
            'record_count': row.record_count
        }
    
    return summary


@router.get("/instruments")
async def get_instruments(
    instrument_type: Optional[str] = Query(None, pattern="^(DEPOSITO|BOND_COUPON|BOND_MATURITY)$"),
    sub_fund: Optional[str] = Query(None, pattern="^(OPEX|CAPEX)$"),
    management_type: Optional[str] = Query(None, pattern="^(SYARIAH|KONVENSIONAL)$"),
    db: Session = Depends(get_db)
):
    """Get list of unique instruments from projection data."""
    
    filters = []
    
    if instrument_type:
        filters.append(CFProjection.instrument_type == instrument_type)
    
    if sub_fund:
        filters.append(CFProjection.sub_fund == sub_fund)
    
    if management_type:
        filters.append(CFProjection.management_type == management_type)
    
    query = db.query(
        CFProjection.instrument_code,
        CFProjection.instrument_name,
        CFProjection.instrument_type,
        CFProjection.sub_fund,
        CFProjection.management_type
    )
    
    if filters:
        query = query.filter(*filters)
    
    results = query.distinct().all()
    
    return [
        {
            'instrument_code': row.instrument_code,
            'instrument_name': row.instrument_name,
            'instrument_type': row.instrument_type,
            'sub_fund': row.sub_fund,
            'management_type': row.management_type
        }
        for row in results
    ]
