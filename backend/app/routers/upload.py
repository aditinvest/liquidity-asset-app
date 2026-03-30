from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import shutil
import os
from datetime import datetime
from decimal import Decimal

from ..database import get_db
from ..models.models import UploadBatch, CFProjection, CFRealization
from ..services.excel_parser import parse_projection_excel, parse_realization_excel

router = APIRouter()

UPLOAD_DIR = "./uploads"


@router.post("/projection")
async def upload_projection(
    file: UploadFile = File(...),
    uploaded_by: Optional[str] = None,
    clear_existing: bool = Query(False, description="Clear existing projection data before upload"),
    db: Session = Depends(get_db)
):
    """Upload and process Cash Flow Projection Excel file."""
    
    # Validate file extension
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx) files are allowed")
    
    # Save uploaded file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"projection_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Parse Excel file
        parsed_data = parse_projection_excel(file_path)

        # Clear existing data if requested
        if clear_existing:
            db.query(CFProjection).delete()
            db.commit()

        # Create upload batch record
        upload_batch = UploadBatch(
            file_name=file.filename,
            upload_type="PROJECTION",
            uploaded_by=uploaded_by
        )
        db.add(upload_batch)
        db.commit()
        db.refresh(upload_batch)

        # Insert parsed data into cf_projections
        records_created = 0

        # Process Deposito data
        for item in parsed_data.get('deposito', []):
            if item['transaction_date'] is not None:
                projection = CFProjection(
                    batch_id=upload_batch.id,
                    **item
                )
                db.add(projection)
                records_created += 1

        # Process Bond data
        for item in parsed_data.get('bond', []):
            if item['transaction_date'] is not None:
                projection = CFProjection(
                    batch_id=upload_batch.id,
                    **item
                )
                db.add(projection)
                records_created += 1

        db.commit()
        
        return {
            "message": "Projection file uploaded and processed successfully",
            "file_name": file.filename,
            "batch_id": upload_batch.id,
            "records_created": records_created,
            "deposito_records": len(parsed_data.get('deposito', [])),
            "bond_records": len(parsed_data.get('bond', []))
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)


@router.delete("/projection")
async def clear_projection_data(
    db: Session = Depends(get_db)
):
    """Clear all existing projection data."""
    
    deleted_count = db.query(CFProjection).delete()
    db.commit()
    
    return {
        "message": "All projection data cleared successfully",
        "records_deleted": deleted_count
    }


@router.delete("/realization")
async def clear_realization_data(
    db: Session = Depends(get_db)
):
    """Clear all existing realization data."""
    
    deleted_count = db.query(CFRealization).delete()
    db.commit()
    
    return {
        "message": "All realization data cleared successfully",
        "records_deleted": deleted_count
    }


@router.post("/realization")
async def upload_realization(
    file: UploadFile = File(...),
    uploaded_by: Optional[str] = None,
    clear_existing: bool = Query(False, description="Clear existing realization data before upload"),
    db: Session = Depends(get_db)
):
    """Upload and process Cash Flow Realization Excel file."""

    # Validate file extension
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx) files are allowed")

    # Save uploaded file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"realization_{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        # Read file content
        contents = await file.read()
        
        # Save to file
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Close the uploaded file to release the lock
        await file.close()

        # Parse Excel file
        parsed_data = parse_realization_excel(file_path)

        # Clear existing data if requested
        if clear_existing:
            db.query(CFRealization).delete()
            db.commit()

        # Create upload batch record
        upload_batch = UploadBatch(
            file_name=file.filename,
            upload_type="REALIZATION",
            uploaded_by=uploaded_by
        )
        db.add(upload_batch)
        db.commit()
        db.refresh(upload_batch)

        # Insert parsed data into cf_realizations
        records_created = 0

        for item in parsed_data:
            if item['transaction_date'] is not None:
                realization = CFRealization(
                    batch_id=upload_batch.id,
                    **item
                )
                db.add(realization)
                records_created += 1

        db.commit()

        return {
            "message": "Realization file uploaded and processed successfully",
            "file_name": file.filename,
            "batch_id": upload_batch.id,
            "records_created": records_created
        }

    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up uploaded file - wait a bit to ensure file is released
        import time
        if os.path.exists(file_path):
            try:
                time.sleep(0.1)  # Small delay to ensure file is released
                os.remove(file_path)
            except:
                pass  # Ignore cleanup errors
