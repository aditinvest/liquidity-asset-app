import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.models import CFProjection, UploadBatch
from app.services.excel_parser import parse_projection_excel

def import_projections():
    db = SessionLocal()
    
    # Clear existing data
    deleted = db.query(CFProjection).delete()
    print(f"Deleted {deleted} existing projection records")
    
    # Create new batch
    batch = UploadBatch(
        file_name='Data CF Projection Asset BP 27022026.xlsx',
        upload_type='PROJECTION'
    )
    db.add(batch)
    db.commit()
    
    # Parse Excel file
    excel_path = r'E:\Backup C\Development Apps\liquidity -aset-app 2\Data CF Projection Asset BP 27022026.xlsx'
    data = parse_projection_excel(excel_path)
    
    # Import deposito
    count = 0
    for item in data.get('deposito', []):
        if item['transaction_date']:
            projection = CFProjection(batch_id=batch.id, **item)
            db.add(projection)
            count += 1
    
    # Import bond
    for item in data.get('bond', []):
        if item['transaction_date']:
            projection = CFProjection(batch_id=batch.id, **item)
            db.add(projection)
            count += 1
    
    db.commit()
    print(f"Imported {count} projection records")
    print(f"  - Deposito: {len(data.get('deposito', []))}")
    print(f"  - Bond: {len(data.get('bond', []))}")
    
    # Verify March 11 OPEX Conventional
    march_11_opex_conv = db.query(CFProjection).filter(
        CFProjection.transaction_date == '2026-03-11',
        CFProjection.sub_fund == 'OPEX',
        CFProjection.management_type == 'KONVENSIONAL'
    ).all()
    
    print(f"\nMarch 11, 2026 - OPEX Conventional entries: {len(march_11_opex_conv)}")
    total = sum(p.amount for p in march_11_opex_conv)
    print(f"Total amount: {total}")
    
    db.close()

if __name__ == '__main__':
    import_projections()
