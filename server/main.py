from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
import logging
import os
from starlette.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from models import BatteryParameters, SOCRequest, SOHRequest, ResistanceRequest
from battery_diagnostics import BatteryDiagnostics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Battery OS API",
    description="Advanced Battery Diagnostics and Analysis API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Replit environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# For testing without database
test_db = {
    "diagnostic_history": [],
    "prediction_history": []
}

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    """Custom exception handler for HTTP errors"""
    logger.error(f"HTTP error occurred: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    """Custom 404 handler"""
    logger.error(f"404 error: Path {request.url.path} not found")
    return JSONResponse(
        status_code=404,
        content={
            "detail": "The requested resource was not found",
            "path": request.url.path,
            "available_endpoints": [
                "/",
                "/health",
                "/api-list",
                "/api-detail/{parameter}",
                "/battery/diagnose/soc",
                "/battery/diagnose/soh",
                "/battery/diagnose/resistance",
                "/battery/logs"
            ]
        }
    )

@app.on_event("startup")
async def startup_event():
    """Execute on application startup"""
    logger.info("FastAPI application starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown"""
    logger.info("FastAPI application shutting down...")

@app.get("/")
async def root():
    """Root endpoint to verify API is running"""
    logger.info("Root endpoint accessed")
    return JSONResponse({
        "status": "online",
        "message": "Welcome to Battery OS API",
        "documentation": "/docs",
        "health_check": "/health"
    })

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("Health check endpoint accessed")
    try:
        return JSONResponse({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "server": "FastAPI"
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    try:
        # ALWAYS serve the app on port 5001 for consistency
        port = 5001
        logger.info(f"Starting FastAPI server on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")