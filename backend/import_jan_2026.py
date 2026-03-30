import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.models import CFRealization, UploadBatch
from app.services.excel_parser import parse_realization_excel
from datetime import datetime

db = SessionLocal()

# Create upload batch
batch = UploadBatch(
    file_name='Data CF Realisasi Asset BP Jan 2026.xlsx',
    upload_type='REALIZATION',
    uploaded_by='admin'
)
db.add(batch)
db.commit()

# Parse Excel file
excel_path = r'E:\Backup C\Development Apps\liquidity -aset-app 2\Data CF Realisasi Asset BP Jan 2026.xlsx'
data = parse_realization_excel(excel_path)

# Insert data
count = 0
for item in data:
    if item.get('transaction_date'):
        realization = CFRealization(
            batch_id=batch.id,
            **item
        )
        db.add(realization)
        count += 1

db.commit()
print(f'Successfully imported {count} realization records for January 2026')
db.close()
