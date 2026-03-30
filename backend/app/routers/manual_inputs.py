from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import date
from decimal import Decimal

from ..database import get_db
from ..models.models import ManualInput
from ..schemas.schemas import ManualInputCreate, ManualInputResponse

router = APIRouter()


@router.post("/", response_model=ManualInputResponse)
async def create_manual_input(
    manual_input: ManualInputCreate,
    db: Session = Depends(get_db)
):
    """Create a new manual input (Opening Balance or Cash Flow Out)."""
    
    db_input = ManualInput(**manual_input.model_dump())
    db.add(db_input)
    db.commit()
    db.refresh(db_input)
    
    return db_input


@router.post("/bulk")
async def create_bulk_manual_inputs(
    inputs: List[ManualInputCreate],
    db: Session = Depends(get_db)
):
    """Create multiple manual inputs at once."""
    
    created_inputs = []
    
    for input_data in inputs:
        db_input = ManualInput(**input_data.model_dump())
        db.add(db_input)
        created_inputs.append(db_input)
    
    db.commit()
    
    for input_item in created_inputs:
        db.refresh(input_item)
    
    return {
        "message": f"Successfully created {len(created_inputs)} manual inputs",
        "count": len(created_inputs),
        "data": created_inputs
    }


@router.get("/", response_model=List[ManualInputResponse])
async def get_manual_inputs(
    input_type: Optional[str] = Query(None, pattern="^(SALDO_AWAL|CF_OUT)$"),
    sub_fund: Optional[str] = Query(None, pattern="^(OPEX|CAPEX)$"),
    management_type: Optional[str] = Query(None, pattern="^(SYARIAH|KONVENSIONAL)$"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Get manual inputs with optional filters."""
    
    filters = []
    
    if input_type:
        filters.append(ManualInput.input_type == input_type)
    
    if sub_fund:
        filters.append(ManualInput.sub_fund == sub_fund)
    
    if management_type:
        filters.append(ManualInput.management_type == management_type)
    
    if start_date:
        filters.append(ManualInput.transaction_date >= start_date)
    
    if end_date:
        filters.append(ManualInput.transaction_date <= end_date)
    
    query = db.query(ManualInput)
    
    if filters:
        query = query.filter(*filters)
    
    results = query.order_by(ManualInput.transaction_date).all()
    
    return results


@router.get("/saldo-awal")
async def get_saldo_awal(
    sub_fund: Optional[str] = Query(None, pattern="^(OPEX|CAPEX)$"),
    management_type: Optional[str] = Query(None, pattern="^(SYARIAH|KONVENSIONAL)$"),
    db: Session = Depends(get_db)
):
    """Get the latest opening balance (Saldo Awal) for each sub-fund and management type."""
    
    filters = [ManualInput.input_type == 'SALDO_AWAL']
    
    if sub_fund:
        filters.append(ManualInput.sub_fund == sub_fund)
    
    if management_type:
        filters.append(ManualInput.management_type == management_type)
    
    # Get the latest record for each combination
    subquery = db.query(
        ManualInput.sub_fund,
        ManualInput.management_type,
        func.max(ManualInput.transaction_date).label('max_date')
    ).filter(*filters).group_by(
        ManualInput.sub_fund,
        ManualInput.management_type
    ).subquery()
    
    results = db.query(ManualInput).join(
        subquery,
        (ManualInput.sub_fund == subquery.c.sub_fund) &
        (ManualInput.management_type == subquery.c.management_type) &
        (ManualInput.transaction_date == subquery.c.max_date)
    ).all()
    
    return results


@router.put("/{input_id}", response_model=ManualInputResponse)
async def update_manual_input(
    input_id: int,
    manual_input: ManualInputCreate,
    db: Session = Depends(get_db)
):
    """Update an existing manual input."""
    
    db_input = db.query(ManualInput).filter(ManualInput.id == input_id).first()
    
    if not db_input:
        raise HTTPException(status_code=404, detail="Manual input not found")
    
    for key, value in manual_input.model_dump().items():
        setattr(db_input, key, value)
    
    db.commit()
    db.refresh(db_input)
    
    return db_input


@router.delete("/{input_id}")
async def delete_manual_input(
    input_id: int,
    db: Session = Depends(get_db)
):
    """Delete a manual input."""
    
    db_input = db.query(ManualInput).filter(ManualInput.id == input_id).first()
    
    if not db_input:
        raise HTTPException(status_code=404, detail="Manual input not found")
    
    db.delete(db_input)
    db.commit()
    
    return {"message": "Manual input deleted successfully", "id": input_id}
