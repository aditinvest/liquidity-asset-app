from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

# Set up logging FIRST before any imports
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import routers BEFORE creating app to avoid issues
from app.routers import upload, projections, realizations, manual_inputs, export, portfolio

logger.info("Starting Liquidity Asset App API...")

app = FastAPI(
    title="Liquidity Asset App API",
    description="API for Liquidity Asset Management - Cash Flow Projection and Realization",
    version="1.0.0"
)

# CORS configuration - Must be added BEFORE including routers
# For production, you can specify exact domains instead of "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all domains (change to specific domains in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if not exists
os.makedirs("./uploads", exist_ok=True)

# Include routers
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(projections.router, prefix="/api/projections", tags=["Projections"])
app.include_router(realizations.router, prefix="/api/realizations", tags=["Realizations"])
app.include_router(manual_inputs.router, prefix="/api/manual-inputs", tags=["Manual Inputs"])
app.include_router(export.router, prefix="/api/projections", tags=["Export"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])

@app.get("/")
async def root():
    return {"message": "Liquidity Asset App API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
