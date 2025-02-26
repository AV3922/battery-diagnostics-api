from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Optional

from .models import BatteryParameters, SOCRequest, SOHRequest, ResistanceRequest # Assuming these models are defined in .models file
from .battery_diagnostics import BatteryDiagnostics

# Initialize Firebase
cred = credentials.Certificate("firebase-credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(
    title="Battery OS API",
    description="Advanced Battery Diagnostics and Analysis API",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication middleware
async def verify_api_key(x_api_key: str = Header(...)):
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    # Verify API key in Firebase
    user_ref = db.collection('users').where('api_key', '==', x_api_key).limit(1)
    user = user_ref.get()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return user[0].id

@app.get("/api-list")
async def get_api_list():
    """List all available diagnostic parameters and their descriptions"""
    return {
        "apis": [
            {
                "id": "voltage",
                "name": "Voltage Analysis",
                "description": "Monitor and analyze battery voltage levels",
                "batteryTypes": ["Li-ion", "LiFePO₄", "Lead-acid"]
            },
            {
                "id": "soc",
                "name": "State of Charge",
                "description": "Calculate real-time battery charge levels",
                "batteryTypes": ["Li-ion", "LiFePO₄", "Lead-acid"]
            },
            # Add other APIs
        ]
    }

@app.get("/api-detail/{parameter}")
async def get_api_detail(parameter: str):
    """Get detailed API documentation for a specific parameter"""
    api_docs = {
        "voltage": {
            "name": "Voltage Analysis API",
            "description": "Monitor battery voltage levels",
            "parameters": [
                {"name": "batteryType", "type": "string", "description": "Battery chemistry type"},
                {"name": "voltage", "type": "number", "description": "Current voltage (V)"},
                {"name": "cellCount", "type": "integer", "description": "Number of cells"}
            ],
            "responses": [
                {"name": "nominalVoltage", "description": "Standard operating voltage"},
                {"name": "maxVoltage", "description": "Maximum safe voltage"},
                {"name": "minVoltage", "description": "Minimum safe voltage"}
            ]
        },
        # Add other parameter documentation
    }

    if parameter not in api_docs:
        raise HTTPException(status_code=404, detail="Parameter not found")
    return api_docs[parameter]

@app.post("/battery/diagnose/soc")
async def analyze_soc(request: SOCRequest, user_id: str = Depends(verify_api_key)):
    """Calculate State of Charge"""
    try:
        result = BatteryDiagnostics.calculate_soc(
            request.voltage,
            request.batteryType,
            request.temperature
        )

        # Store test history
        db.collection('diagnostic_history').add({
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

        db.collection('diagnostic_history').add({
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
        result = BatteryDiagnostics.measure_internal_resistance(
            request.voltage,
            request.current,
            request.temperature,
            request.batteryType
        )

        db.collection('diagnostic_history').add({
            'user_id': user_id,
            'timestamp': datetime.now(),
            'type': 'resistance',
            'parameters': request.dict(),
            'results': result
        })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add other diagnostic endpoints similarly

@app.get("/battery/logs")
async def get_diagnostic_history(user_id: str = Depends(verify_api_key)):
    """Retrieve battery test history"""
    try:
        logs = db.collection('diagnostic_history')\
                 .where('user_id', '==', user_id)\
                 .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                 .limit(100)\
                 .stream()

        return {
            "logs": [doc.to_dict() for doc in logs]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/battery/predict")
async def predict_battery_health(params: BatteryParameters, user_id: str = Depends(verify_api_key)):
    """Predict battery degradation and potential faults"""
    try:
        # Example prediction logic (to be implemented with ML model)
        predictions = {
            "degradationRate": 0.05,
            "predictedFailures": [],
            "remainingLifetime": "365 days"
        }

        db.collection('prediction_history').add({
            'user_id': user_id,
            'timestamp': datetime.now(),
            'parameters': params.dict(),
            'predictions': predictions
        })

        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_soc(voltage: float, battery_type: str) -> float:
    # Implement SOC calculation logic
    return 85.0  # Example value

def calculate_soh(capacity: Optional[float], cycle_count: Optional[int]) -> float:
    # Implement SOH calculation logic
    return 90.0  # Example value

def check_safety_risks(temperature: float, current: float) -> List[str]:
    risks = []
    if temperature > 45:
        risks.append("High temperature warning")
    if current > 10:
        risks.append("High current warning")
    return risks

def generate_recommendations(risks: List[str]) -> List[str]:
    recommendations = []
    for risk in risks:
        if "temperature" in risk.lower():
            recommendations.append("Reduce load and improve cooling")
        if "current" in risk.lower():
            recommendations.append("Check for short circuits and reduce load")
    return recommendations


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)