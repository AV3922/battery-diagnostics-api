from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Create FastAPI app with detailed metadata for Swagger UI
app = FastAPI(
    title="Battery OS API",
    description="""
    Advanced diagnostic platform for comprehensive battery performance analysis.

    Features:
    - Real-time battery diagnostics
    - AI-powered predictive maintenance
    - Performance analytics
    - Customizable alert thresholds
    """,
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

# Models
class BatteryMetrics(BaseModel):
    voltage: float
    temperature: float
    stateOfCharge: float
    stateOfHealth: float
    internalResistance: float
    capacity: float
    timestamp: datetime

    class Config:
        schema_extra = {
            "example": {
                "voltage": 48.2,
                "temperature": 25.3,
                "stateOfCharge": 85.5,
                "stateOfHealth": 97.2,
                "internalResistance": 0.015,
                "capacity": 100.0,
                "timestamp": "2025-03-04T10:30:00"
            }
        }

class AlertThreshold(BaseModel):
    parameterName: str
    minValue: Optional[float]
    maxValue: Optional[float]
    severity: str
    notificationMethod: str

    class Config:
        schema_extra = {
            "example": {
                "parameterName": "voltage",
                "minValue": 45.0,
                "maxValue": 52.0,
                "severity": "warning",
                "notificationMethod": "email"
            }
        }

class AlertHistory(BaseModel):
    id: int
    parameterName: str
    value: float
    timestamp: datetime
    severity: str
    message: str
    acknowledged: bool
    acknowledgedAt: Optional[datetime]

# Routes
@app.get("/api/v1/diagnostics/voltage", 
         tags=["Battery Diagnostics"],
         response_model=dict,
         summary="Get current battery voltage metrics")
async def get_voltage():
    """
    Get real-time voltage metrics for the battery system.

    Returns:
        dict: Contains voltage, nominal voltage, state of charge, and other related metrics
    """
    return {
        "voltage": 48.2,
        "nominalVoltage": 48.0,
        "stateOfCharge": 85,
        "estimatedRange": 150,
        "temperature": 25,
        "temperatureStatus": "Normal"
    }

@app.get("/api/v1/diagnostics/cell-balance",
         tags=["Battery Diagnostics"],
         response_model=dict,
         summary="Get cell balance information")
async def get_cell_balance():
    """
    Get detailed cell balance information for all cells in the battery pack.

    Returns:
        dict: Contains cell voltages, maximum imbalance, and balance status
    """
    return {
        "cellVoltages": [3.95, 3.97, 3.96, 3.94, 3.95, 3.96, 3.97, 3.95],
        "maxImbalance": 0.03,
        "balanceStatus": "Good"
    }

@app.post("/api/v1/alert-thresholds",
          tags=["Alert Management"],
          response_model=AlertThreshold,
          summary="Create new alert threshold")
async def create_alert_threshold(threshold: AlertThreshold):
    """
    Create a new alert threshold for battery parameters.

    Args:
        threshold (AlertThreshold): The threshold configuration

    Returns:
        AlertThreshold: The created alert threshold
    """
    return threshold

@app.get("/api/v1/alert-history",
         tags=["Alert Management"],
         response_model=List[AlertHistory],
         summary="Get alert history")
async def get_alert_history():
    """
    Get the history of all alerts triggered in the system.

    Returns:
        List[AlertHistory]: List of historical alerts
    """
    return []

@app.get("/health", 
         tags=["System"],
         summary="System health check")
async def health_check():
    """
    Check if the API is running and healthy.
    """
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)