from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from decimal import Decimal
from datetime import date

from ..database import get_db
from ..models.models import CFRealization
from ..schemas.schemas import RealizationReportSummary, RealizationReportItem

router = APIRouter()


@router.get("/report", response_model=RealizationReportSummary)
async def get_realization_report(
    month: int = Query(None, ge=1, le=12),
    year: int = Query(None, ge=2020),
    sub_fund: Optional[str] = Query(None, pattern="^(OPEX|CAPEX)$"),
    management_type: Optional[str] = Query(None, pattern="^(SYARIAH|KONVENSIONAL)$"),
    transaction_category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get cash flow realization report grouped by date and transaction category.
    """

    filters = []

    if month:
        filters.append(extract('month', CFRealization.transaction_date) == month)
    
    if year:
        filters.append(extract('year', CFRealization.transaction_date) == year)

    if sub_fund:
        filters.append(CFRealization.sub_fund == sub_fund)

    if management_type:
        filters.append(CFRealization.management_type == management_type)

    if transaction_category:
        filters.append(CFRealization.transaction_category == transaction_category)
    
    # Get realization data
    query = db.query(
        CFRealization.transaction_date,
        CFRealization.sub_fund,
        CFRealization.management_type,
        CFRealization.transaction_category,
        CFRealization.instrument_name,
        CFRealization.proceed_amount
    )
    
    if filters:
        query = query.filter(*filters)
    
    results = query.order_by(CFRealization.transaction_date).all()
    
    # Build report items
    report_items = []
    total_amount = Decimal('0.00')
    
    for row in results:
        report_items.append(RealizationReportItem(
            date=row.transaction_date,
            sub_fund=row.sub_fund,
            management_type=row.management_type,
            transaction_category=row.transaction_category,
            instrument_name=row.instrument_name or '',
            proceed_amount=row.proceed_amount or Decimal('0.00')
        ))
        
        total_amount += row.proceed_amount or Decimal('0.00')
    
    # Sort by date
    report_items.sort(key=lambda x: x.date)
    
    return RealizationReportSummary(
        sub_fund=sub_fund,
        management_type=management_type,
        total_amount=total_amount,
        data=report_items
    )


@router.get("/summary")
async def get_realization_summary(
    sub_fund: Optional[str] = Query(None, pattern="^(OPEX|CAPEX)$"),
    management_type: Optional[str] = Query(None, pattern="^(SYARIAH|KONVENSIONAL)$"),
    db: Session = Depends(get_db)
):
    """Get summary of realization data by category."""
    
    filters = []
    
    if sub_fund:
        filters.append(CFRealization.sub_fund == sub_fund)
    
    if management_type:
        filters.append(CFRealization.management_type == management_type)
    
    query = db.query(
        CFRealization.transaction_category,
        func.sum(CFRealization.proceed_amount).label('total_amount'),
        func.count(CFRealization.id).label('record_count')
    )
    
    if filters:
        query = query.filter(*filters)
    
    results = query.group_by(CFRealization.transaction_category).all()
    
    summary = {}
    for row in results:
        summary[row.transaction_category] = {
            'total_amount': float(row.total_amount) if row.total_amount else 0.0,
            'record_count': row.record_count
        }
    
    return summary


@router.get("/pivot")
async def get_realization_pivot(
    month: int = Query(None, ge=1, le=12),
    year: int = Query(None, ge=2020),
    sub_fund: Optional[str] = Query(None, pattern="^(OPEX|CAPEX)$"),
    management_type: Optional[str] = Query(None, pattern="^(SYARIAH|KONVENSIONAL)$"),
    db: Session = Depends(get_db)
):
    """
    Get realization data in pivot format grouped by date (X-axis) and
    transaction category & instrument (Y-axis). Data is summed for the same date.
    """

    filters = []

    if month:
        filters.append(extract('month', CFRealization.transaction_date) == month)

    if year:
        filters.append(extract('year', CFRealization.transaction_date) == year)

    if sub_fund:
        filters.append(CFRealization.sub_fund == sub_fund)

    if management_type:
        filters.append(CFRealization.management_type == management_type)

    # Get all unique dates
    dates_query = db.query(CFRealization.transaction_date).filter(*filters).distinct()
    dates = [row.transaction_date for row in dates_query.order_by(CFRealization.transaction_date)]

    # Get all unique category-instrument combinations
    combinations_query = db.query(
        CFRealization.transaction_category,
        CFRealization.instrument_name
    ).filter(*filters).distinct()

    combinations = [
        (row.transaction_category, row.instrument_name)
        for row in combinations_query.order_by(
            CFRealization.transaction_category,
            CFRealization.instrument_name
        )
    ]

    # Get data for pivot - SUM by date, category, and instrument
    pivot_data = {}
    for date in dates:
        pivot_data[date] = {}
        for combo in combinations:
            pivot_data[date][combo] = Decimal('0.00')

    # Fill in actual values - aggregated by SUM
    data_query = db.query(
        CFRealization.transaction_date,
        CFRealization.transaction_category,
        CFRealization.instrument_name,
        func.sum(CFRealization.proceed_amount).label('total_amount')
    ).filter(*filters).group_by(
        CFRealization.transaction_date,
        CFRealization.transaction_category,
        CFRealization.instrument_name
    )

    for row in data_query:
        key = (row.transaction_category, row.instrument_name or '')
        if row.transaction_date in pivot_data and key in pivot_data[row.transaction_date]:
            pivot_data[row.transaction_date][key] = row.total_amount or Decimal('0.00')

    # Format for response
    pivot_rows = []
    for combo in combinations:
        row_data = {
            'transaction_category': combo[0],
            'instrument_name': combo[1],
            'values': {}
        }
        for date in dates:
            row_data['values'][str(date)] = float(pivot_data[date][combo])
        pivot_rows.append(row_data)

    return {
        'dates': [str(d) for d in dates],
        'rows': pivot_rows,
        'sub_fund': sub_fund,
        'management_type': management_type
    }
