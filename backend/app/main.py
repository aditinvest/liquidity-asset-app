from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import traceback

# Set up logging FIRST
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info("=" * 50)
logger.info("Starting Liquidity Asset App API...")
logger.info("=" * 50)

try:
    logger.info("Importing routers...")
    from app.routers import upload, projections, realizations, manual_inputs, export, portfolio
    logger.info("Routers imported successfully!")
except Exception as e:
    logger.error(f"Error importing routers: {e}")
    logger.error(traceback.format_exc())
    raise

try:
    logger.info("Creating FastAPI app...")
    app = FastAPI(
        title="Liquidity Asset App API",
        description="API for Liquidity Asset Management",
        version="1.0.0"
    )
    logger.info("FastAPI app created!")
except Exception as e:
    logger.error(f"Error creating app: {e}")
    raise

# CORS configuration
logger.info("Adding CORS middleware...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS added!")

# Create uploads directory
logger.info("Creating uploads directory...")
os.makedirs("./uploads", exist_ok=True)
logger.info("Uploads directory ready!")

# Include routers
logger.info("Including routers...")
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(projections.router, prefix="/api/projections", tags=["Projections"])
app.include_router(realizations.router, prefix="/api/realizations", tags=["Realizations"])
app.include_router(manual_inputs.router, prefix="/api/manual-inputs", tags=["Manual Inputs"])
app.include_router(export.router, prefix="/api/projections", tags=["Export"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
logger.info("All routers included!")

@app.get("/")
async def root():
    return {"message": "Liquidity Asset App API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

logger.info("=" * 50)
logger.info("✅ Application startup complete!")
logger.info("=" * 50)
