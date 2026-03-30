from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from ..database import Base


class UploadBatch(Base):
    __tablename__ = "upload_batches"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    upload_type = Column(String(50), nullable=False)  # PROJECTION or REALIZATION
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(String(100))


class CFProjection(Base):
    __tablename__ = "cf_projections"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("upload_batches.id", ondelete="CASCADE"))
    sub_fund = Column(String(10), nullable=False)  # OPEX or CAPEX
    management_type = Column(String(20), nullable=False)  # SYARIAH or KONVENSIONAL
    instrument_type = Column(String(20), nullable=False)  # DEPOSITO, BOND_COUPON, BOND_MATURITY
    fund_id = Column(String(100))
    instrument_code = Column(String(100))  # CounterpartID / SecuritiesID
    instrument_name = Column(String(255))  # CounterpartName / SecuritiesName
    transaction_date = Column(Date, nullable=False, index=True)
    amount = Column(Numeric(20, 2), default=0.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CFRealization(Base):
    __tablename__ = "cf_realizations"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("upload_batches.id", ondelete="CASCADE"))
    sub_fund = Column(String(10), nullable=False)  # OPEX or CAPEX
    management_type = Column(String(20), nullable=False)  # SYARIAH or KONVENSIONAL
    transaction_category = Column(String(50))  # Deposit Disbursement, Bond Purchase, etc.
    fund_id = Column(String(100))
    instrument_name = Column(String(255))  # BSI, BJBR, FR0059, etc.
    transaction_date = Column(Date, nullable=False, index=True)
    proceed_amount = Column(Numeric(20, 2), default=0.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ManualInput(Base):
    __tablename__ = "manual_inputs"

    id = Column(Integer, primary_key=True, index=True)
    input_type = Column(String(20), nullable=False)  # SALDO_AWAL or CF_OUT
    sub_fund = Column(String(10), nullable=False)  # OPEX or CAPEX
    management_type = Column(String(20), nullable=False)  # SYARIAH or KONVENSIONAL
    transaction_date = Column(Date, nullable=False)
    amount = Column(Numeric(20, 2), default=0.00)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    data_source_date = Column(Date, nullable=False)
    total_assets = Column(Numeric(20, 2), default=0.00)


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    snapshot_id = Column(Integer, ForeignKey("portfolio_snapshots.id", ondelete="CASCADE"))
    fund_id = Column(String(50))  # e.g., JPOIP
    sub_fund = Column(String(10), nullable=False)  # OPEX or CAPEX
    management_type = Column(String(20), nullable=False)  # SYARIAH or KONVENSIONAL
    asset_type = Column(String(20), nullable=False)  # DEPOSITO or BOND
    security_id = Column(String(100))  # CounterpartID or SecuritiesID
    security_name = Column(String(255))  # CounterpartName or SecuritiesName
    maturity_date = Column(Date, nullable=False)
    principal_amount = Column(Numeric(20, 2), default=0.00)
    coupon_amount = Column(Numeric(20, 2), default=0.00)  # For Bonds only
    frequency_months = Column(Integer, default=0)  # For Bonds only
    next_coupon_date = Column(Date)
    securities_type_desc = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
