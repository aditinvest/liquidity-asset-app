import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.models import CFProjection, ManualInput
from app.routers.projections import get_projection_report
from sqlalchemy.orm import Session

db = SessionLocal()

# Call the report function
import asyncio
from fastapi import Query

async def test():
    result = await get_projection_report(
        month=3,
        year=2026,
        sub_fund="OPEX",
        management_type="KONVENSIONAL",
        db=db
    )
    
    print("Date | Opening Bal | Deposito In | CF Out | Net CF | Ending Bal")
    print("-" * 80)
    for item in result.data:
        print(f"{item.date} | {float(item.opening_balance)/1e6:.2f} | {float(item.deposito_in)/1e6:.2f} | {float(item.cf_out)/1e6:.2f} | {float(item.net_cashflow)/1e6:.2f} | {float(item.ending_balance)/1e6:.2f}")

asyncio.run(test())
db.close()
