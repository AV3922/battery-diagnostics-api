from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator

from models import BatteryParameters, SOCRequest, SOHRequest, ResistanceRequest
from battery_diagnostics import BatteryDiagnostics

app = FastAPI(
    title="Battery OS API",
    description="Advanced Battery Diagnostics and Analysis API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For testing without Firebase
test_db = {
    "diagnostic_history": [],
    "prediction_history": []
}

@app.get("/")
async def root():
    """Root endpoint to verify API is running"""
    return {
        "status": "online",
        "message": "Welcome to Battery OS API",
        "documentation": "/docs",
        "health_check": "/health"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

async def verify_api_key(x_api_key: str = Header(...)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    # For testing, accept any non-empty API key
    return "test_user_id"

@app.get("/api-list")
async def get_api_list():
    """List all available diagnostic parameters and their descriptions"""
    return {
        "apis": [api for api in BatteryDiagnostics.BATTERY_SPECS.keys()]
    }

@app.get("/api-detail/{parameter}")
async def get_api_detail(parameter: str):
    """Get detailed API documentation for a specific parameter"""
    if parameter not in BatteryDiagnostics.BATTERY_SPECS:
        raise HTTPException(status_code=404, detail="Battery type not found")
    return BatteryDiagnostics.BATTERY_SPECS[parameter]

@app.post("/battery/diagnose/soc")
async def analyze_soc(request: SOCRequest, user_id: str = Depends(verify_api_key)):
    """Calculate State of Charge"""
    try:
        if request.batteryType not in BatteryDiagnostics.BATTERY_SPECS:
            raise HTTPException(status_code=400, detail="Invalid battery type")

        result = BatteryDiagnostics.calculate_soc(
            request.voltage,
            request.batteryType,
            request.temperature
        )

        test_db["diagnostic_history"].append({
            'user_id': user_id,
            'timestamp': datetime.now(),
            'type': 'soc',
            'parameters': request.dict(),
            'results': result
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/battery/diagnose/soh")
async def analyze_soh(request: SOHRequest, user_id: str = Depends(verify_api_key)):
    """Calculate State of Health"""
    try:
        result = BatteryDiagnostics.calculate_soh(
            request.currentCapacity,
            request.ratedCapacity,
            request.cycleCount
        )

        test_db["diagnostic_history"].append({
            'user_id': user_id,
            'timestamp': datetime.now(),
            'type': 'soh',
            'parameters': request.dict(),
            'results': result
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/battery/diagnose/resistance")
async def analyze_resistance(request: ResistanceRequest, user_id: str = Depends(verify_api_key)):
    """Measure internal resistance"""
    try:
        if request.batteryType not in BatteryDiagnostics.BATTERY_SPECS:
            raise HTTPException(status_code=400, detail="Invalid battery type")

        result = BatteryDiagnostics.measure_internal_resistance(
            request.voltage,
            request.current,
            request.temperature,
            request.batteryType
        )

        test_db["diagnostic_history"].append({
            'user_id': user_id,
            'timestamp': datetime.now(),
            'type': 'resistance',
            'parameters': request.dict(),
            'results': result
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/battery/logs")
async def get_diagnostic_history(user_id: str = Depends(verify_api_key)):
    """Retrieve battery test history"""
    try:
        filtered_logs = [log for log in test_db["diagnostic_history"] if log['user_id'] == user_id]
        filtered_logs.sort(key=lambda x: x['timestamp'], reverse=True)
        return {
            "logs": filtered_logs[:100]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)