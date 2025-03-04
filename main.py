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
    docs_url="/docs",  # ✅ Ensure Swagger UI is enabled
    redoc_url="/redoc",
    openapi_url="/openapi.json"  # ✅ Ensure OpenAPI JSON is available
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

@app.get("/api-list")
async def api_list():
    """Returns a list of available API endpoints"""
    return {
        "endpoints": [
            "/",
            "/health",
            "/docs",
            "/api-list",
            "/battery/diagnose/soc",
            "/battery/diagnose/soh",
            "/battery/diagnose/resistance",
            "/battery/logs"
        ]
    }


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

@app.api_route("/", methods=["GET", "HEAD"])
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

@app.post("/battery/diagnose/soc")
async def diagnose_soc(request: SOCRequest, x_api_key: Optional[str] = Header(None)):
    """Calculate State of Charge based on voltage"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    
    try:
        logger.info(f"SOC diagnosis for {request.batteryType} battery")
        result = BatteryDiagnostics.calculate_soc(
            voltage=request.voltage,
            battery_type=request.batteryType,
            temperature=request.temperature,
            current=request.current,
            nominal_voltage=request.nominalVoltage
        )
        
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "soc",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"SOC calculation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in SOC diagnosis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/battery/logs")
async def get_diagnostic_history(x_api_key: Optional[str] = Header(None)):
    """Retrieve battery diagnostic history"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info("Retrieving diagnostic history")
        return JSONResponse({
            "logs": test_db["diagnostic_history"]
        })
    except Exception as e:
        logger.error(f"Error retrieving diagnostic history: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/battery/diagnose/soh")
async def diagnose_soh(request: SOHRequest, x_api_key: Optional[str] = Header(None)):
    """Calculate State of Health based on capacity"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"SOH diagnosis for {request.batteryType} battery")
        result = BatteryDiagnostics.calculate_soh(
            current_capacity=request.currentCapacity,
            rated_capacity=request.ratedCapacity,
            cycle_count=request.cycleCount
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "soh",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"SOH calculation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in SOH diagnosis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/battery/diagnose/resistance")
async def diagnose_resistance(request: ResistanceRequest, x_api_key: Optional[str] = Header(None)):
    """Calculate internal resistance"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"Resistance diagnosis for {request.batteryType} battery")
        result = BatteryDiagnostics.measure_internal_resistance(
            voltage=request.voltage,
            current=request.current,
            temperature=request.temperature,
            battery_type=request.batteryType
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "resistance",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"Resistance calculation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in resistance diagnosis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(status_code=204)  # No content response


if __name__ == "__main__":
    import uvicorn
    import os
    try:
        # Dynamically assign the correct port
        port = int(os.getenv("PORT", 8000))  
        logger.info(f"Starting FastAPI server on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
