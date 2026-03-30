from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


# Upload Batch Schemas
class UploadBatchBase(BaseModel):
    file_name: str
    upload_type: str


class UploadBatchCreate(UploadBatchBase):
    uploaded_by: Optional[str] = None


class UploadBatchResponse(UploadBatchBase):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


# CF Projection Schemas
class CFProjectionBase(BaseModel):
    sub_fund: str = Field(..., pattern="^(OPEX|CAPEX)$")
    management_type: str = Field(..., pattern="^(SYARIAH|KONVENSIONAL)$")
    instrument_type: str = Field(..., pattern="^(DEPOSITO|BOND_COUPON|BOND_MATURITY)$")
    fund_id: Optional[str] = None
    instrument_code: Optional[str] = None
    instrument_name: Optional[str] = None
    transaction_date: date
    amount: Decimal = Decimal("0.00")


class CFProjectionCreate(CFProjectionBase):
    batch_id: Optional[int] = None


class CFProjectionResponse(CFProjectionBase):
    id: int
    batch_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# CF Realization Schemas
class CFRealizationBase(BaseModel):
    sub_fund: str = Field(..., pattern="^(OPEX|CAPEX)$")
    management_type: str = Field(..., pattern="^(SYARIAH|KONVENSIONAL)$")
    transaction_category: Optional[str] = None
    fund_id: Optional[str] = None
    instrument_name: Optional[str] = None
    transaction_date: date
    proceed_amount: Decimal = Decimal("0.00")


class CFRealizationCreate(CFRealizationBase):
    batch_id: Optional[int] = None


class CFRealizationResponse(CFRealizationBase):
    id: int
    batch_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Manual Input Schemas
class ManualInputBase(BaseModel):
    input_type: str = Field(..., pattern="^(SALDO_AWAL|CF_OUT|SALDO_AWAL_REALISASI|CF_OUT_REALISASI)$")
    sub_fund: str = Field(..., pattern="^(OPEX|CAPEX)$")
    management_type: str = Field(..., pattern="^(SYARIAH|KONVENSIONAL)$")
    transaction_date: date
    amount: Decimal = Decimal("0.00")
    description: Optional[str] = None


class ManualInputCreate(ManualInputBase):
    pass


class ManualInputResponse(ManualInputBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Report Schemas
class ProjectionReportItem(BaseModel):
    date: date
    sub_fund: str
    management_type: str
    deposito_in: Decimal = Decimal("0.00")
    bond_coupon_in: Decimal = Decimal("0.00")
    bond_maturity_in: Decimal = Decimal("0.00")
    cf_out: Decimal = Decimal("0.00")
    total_in: Decimal = Decimal("0.00")
    net_cashflow: Decimal = Decimal("0.00")
    opening_balance: Decimal = Decimal("0.00")
    ending_balance: Decimal = Decimal("0.00")


class ProjectionReportSummary(BaseModel):
    month: int
    year: int
    sub_fund: Optional[str] = None
    management_type: Optional[str] = None
    total_opening_balance: Decimal = Decimal("0.00")
    total_cf_in: Decimal = Decimal("0.00")
    total_cf_out: Decimal = Decimal("0.00")
    total_ending_balance: Decimal = Decimal("0.00")
    data: List[ProjectionReportItem] = []


class RealizationReportItem(BaseModel):
    date: date
    sub_fund: str
    management_type: str
    transaction_category: str
    instrument_name: str
    proceed_amount: Decimal = Decimal("0.00")


class RealizationReportSummary(BaseModel):
    sub_fund: Optional[str] = None
    management_type: Optional[str] = None
    total_amount: Decimal = Decimal("0.00")
    data: List[RealizationReportItem] = []


# Portfolio & Asset Schemas
class AssetBase(BaseModel):
    fund_id: Optional[str] = None
    sub_fund: str = Field(..., pattern="^(OPEX|CAPEX)$")
    management_type: str = Field(..., pattern="^(SYARIAH|KONVENSIONAL)$")
    asset_type: str = Field(..., pattern="^(DEPOSITO|BOND)$")
    security_id: Optional[str] = None
    security_name: Optional[str] = None
    maturity_date: date
    principal_amount: Decimal = Decimal("0.00")
    coupon_amount: Decimal = Decimal("0.00")
    frequency_months: Optional[int] = None
    next_coupon_date: Optional[date] = None
    securities_type_desc: Optional[str] = None


class AssetCreate(AssetBase):
    snapshot_id: Optional[int] = None


class AssetResponse(AssetBase):
    id: int
    snapshot_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioSnapshotBase(BaseModel):
    data_source_date: date
    total_assets: Decimal = Decimal("0.00")


class PortfolioSnapshotCreate(PortfolioSnapshotBase):
    pass


class PortfolioSnapshotResponse(PortfolioSnapshotBase):
    id: int
    upload_date: datetime

    class Config:
        from_attributes = True


class MaturityProfileItem(BaseModel):
    period: str  # e.g., "2026-01" or "2026"
    maturity_amount: Decimal = Decimal("0.00")
    coupon_amount: Decimal = Decimal("0.00")
    total_amount: Decimal = Decimal("0.00")
    asset_count: int = 0


class MaturityProfileSummary(BaseModel):
    sub_fund: Optional[str] = None
    management_type: Optional[str] = None
    asset_type: Optional[str] = None
    total_principal: Decimal = Decimal("0.00")
    data: List[MaturityProfileItem] = []


class MaturityCalendarItem(BaseModel):
    maturity_date: date
    sub_fund: str
    management_type: str
    asset_type: str
    security_id: str
    security_name: str
    principal_amount: Decimal = Decimal("0.00")
    coupon_amount: Decimal = Decimal("0.00")
    total_amount: Decimal = Decimal("0.00")


class MaturityCalendarSummary(BaseModel):
    sub_fund: Optional[str] = None
    management_type: Optional[str] = None
    total_amount: Decimal = Decimal("0.00")
    data: List[MaturityCalendarItem] = []
