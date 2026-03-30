import sys
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test upload
with open(r'E:\Backup C\Development Apps\liquidity -aset-app 2\Data CF Realisasi Asset BP Jan 2026.xlsx', 'rb') as f:
    response = client.post(
        '/api/upload/realization?clear_existing=false',
        files={'file': ('test.xlsx', f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
    )
    print('Status:', response.status_code)
    print('Response:', response.json())
