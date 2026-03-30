import sys
sys.path.insert(0, '.')

import asyncio
from app.database import SessionLocal
from app.models.models import CFRealization, UploadBatch
from app.services.excel_parser import parse_realization_excel
import shutil
import os

async def test_upload():
    db = SessionLocal()
    
    try:
        # Simulate file upload
        src = r'E:\test_upload.xlsx'
        timestamp = '20260326_170000'
        filename = f"realization_{timestamp}_test.xlsx"
        file_path = os.path.join('./uploads', filename)
        
        # Copy file
        shutil.copy2(src, file_path)
        print(f'File saved to {file_path}')
        
        # Parse
        parsed_data = parse_realization_excel(file_path)
        print(f'Parsed {len(parsed_data)} records')
        
        # Create batch
        batch = UploadBatch(
            file_name='test.xlsx',
            upload_type='REALIZATION',
            uploaded_by='admin'
        )
        db.add(batch)
        db.commit()
        print(f'Created batch ID: {batch.id}')
        
        # Insert records
        count = 0
        for item in parsed_data:
            if item['transaction_date']:
                r = CFRealization(batch_id=batch.id, **item)
                db.add(r)
                count += 1
        
        db.commit()
        print(f'Successfully inserted {count} records')
        
        # Clean up
        os.remove(file_path)
        
    except Exception as e:
        db.rollback()
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
    finally:
        db.close()

asyncio.run(test_upload())
