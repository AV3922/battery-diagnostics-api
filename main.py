from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
import logging
import os
from starlette.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from models import (
    BatteryParameters, SOCRequest, SOHRequest, ResistanceRequest, VoltageRequest,
    CapacityFadeRequest, CellBalanceRequest, SafetyRequest, ThermalRequest,
    CycleLifeRequest, FaultRequest
)
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

@app.post("/battery/diagnose/soc", tags=["diagnostics"])
async def diagnose_soc(request: SOCRequest, x_api_key: Optional[str] = Header(None)):
    """Calculate State of Charge based on voltage"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"SOC diagnosis for {request.batteryType} battery with nominal voltage {request.nominalVoltage}V")
        result = BatteryDiagnostics.calculate_soc(
            voltage=request.voltage,
            battery_type=request.batteryType,
            temperature=request.temperature,
            current=request.current,
            nominal_voltage=request.nominalVoltage
        )

        # Store diagnostic history for logs
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

@app.post("/battery/diagnose/soh", tags=["diagnostics"])
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

@app.post("/battery/diagnose/voltage", tags=["diagnostics"])
async def analyze_voltage(request: VoltageRequest, x_api_key: Optional[str] = Header(None)):
    """Analyze voltage levels and provide detailed insights"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"Voltage analysis for {request.batteryType} battery with nominal voltage {request.nominalVoltage}V")
        result = BatteryDiagnostics.analyze_voltage(
            voltage=request.voltage,
            battery_type=request.batteryType,
            nominal_voltage=request.nominalVoltage,
            temperature=request.temperature
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "voltage",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"Voltage analysis error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in voltage analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/battery/diagnose/resistance", tags=["diagnostics"])
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
        
@app.post("/battery/diagnose/capacity-fade", tags=["diagnostics"])
async def analyze_capacity_fade(request: CapacityFadeRequest, x_api_key: Optional[str] = Header(None)):
    """Analyze capacity fade and predict remaining lifetime"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"Capacity fade analysis for {request.batteryType} battery")
        result = BatteryDiagnostics.analyze_capacity_fade(
            initial_capacity=request.initialCapacity,
            current_capacity=request.currentCapacity,
            cycle_count=request.cycleCount,
            time_in_service=request.timeInService
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "capacity-fade",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"Capacity fade analysis error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in capacity fade analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/battery/diagnose/cell-balance", tags=["diagnostics"])
async def check_cell_balance(request: CellBalanceRequest, x_api_key: Optional[str] = Header(None)):
    """Monitor cell voltage balance and identify issues"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"Cell balance check for {request.batteryType} battery")
        result = BatteryDiagnostics.check_cell_balance(
            cell_voltages=request.cellVoltages,
            temperature=request.temperature
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "cell-balance",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"Cell balance check error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in cell balance check: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/battery/diagnose/safety", tags=["diagnostics"])
async def monitor_safety(request: SafetyRequest, x_api_key: Optional[str] = Header(None)):
    """Monitor battery safety parameters and assess risks"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"Safety monitoring for {request.batteryType} battery")
        result = BatteryDiagnostics.monitor_safety(
            voltage=request.voltage,
            current=request.current,
            temperature=request.temperature,
            pressure=request.pressure,
            battery_type=request.batteryType
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "safety",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"Safety monitoring error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in safety monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/battery/diagnose/thermal", tags=["diagnostics"])
async def analyze_thermal(request: ThermalRequest, x_api_key: Optional[str] = Header(None)):
    """Analyze thermal conditions and predict thermal runaway risks"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"Thermal analysis for {request.batteryType} battery")
        result = BatteryDiagnostics.analyze_thermal(
            temperature=request.temperature,
            rate_of_change=request.rateOfChange,
            ambient_temp=request.ambientTemperature,
            load_profile=request.loadProfile
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "thermal",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"Thermal analysis error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in thermal analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/battery/diagnose/cycle-life", tags=["diagnostics"])
async def estimate_cycle_life(request: CycleLifeRequest, x_api_key: Optional[str] = Header(None)):
    """Predict remaining cycle life based on usage patterns"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"Cycle life estimation for {request.batteryType} battery")
        result = BatteryDiagnostics.estimate_cycle_life(
            cycle_count=request.cycleCount,
            depth_of_discharge=request.depthOfDischarge,
            avg_temperature=request.averageTemperature,
            current_soh=request.currentSOH
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "cycle-life",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"Cycle life estimation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in cycle life estimation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/battery/diagnose/faults", tags=["diagnostics"])
async def detect_faults(request: FaultRequest, x_api_key: Optional[str] = Header(None)):
    """Detect and diagnose battery faults"""
    if not x_api_key:
        raise HTTPException(status_code=422, detail="API key is required")
    try:
        logger.info(f"Fault detection for {request.batteryType} battery")
        result = BatteryDiagnostics.detect_faults(
            voltage=request.voltage,
            current=request.current,
            temperature=request.temperature,
            impedance=request.impedance,
            battery_type=request.batteryType
        )

        # Store diagnostic history for logs
        test_db["diagnostic_history"].append({
            "timestamp": datetime.now().isoformat(),
            "type": "faults",
            "batteryType": request.batteryType,
            "result": result
        })

        return JSONResponse(result)
    except ValueError as e:
        logger.error(f"Fault detection error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in fault detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    try:
        # ALWAYS serve the app on port 5000
        port = 5000
        logger.info(f"Starting FastAPI server on port {port}")
        uvicorn.run(app, host="0.0.0.0", port=port, reload=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")