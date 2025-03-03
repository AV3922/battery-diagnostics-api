
from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_health_endpoints():
    """Test base endpoints"""
    response = client.get("/")
    print("Root Endpoint Response:", response.json())  # Print API response
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "online"

    response = client.get("/health")
    print("Health Endpoint Response:", response.json())  # Print API response
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_soc_endpoint():
    """Test State of Charge endpoint"""
    headers = {"x-api-key": "test_key"}

    valid_data = {
        "batteryType": "Li-ion",
        "voltage": 11.1,
        "temperature": 27.0,
        "nominalVoltage": 12.0
    }
    response = client.post("/battery/diagnose/soc", json=valid_data, headers=headers)
    print("SOC Response:", response.json())  # Print API response
    assert response.status_code == 200
    assert "stateOfCharge" in response.json()

def test_soh_endpoint():
    """Test State of Health endpoint"""
    headers = {"x-api-key": "test_key"}

    valid_data = {
        "batteryType": "Li-ion",
        "currentCapacity": 2800,
        "ratedCapacity": 3000,
        "cycleCount": 250
    }
    response = client.post("/battery/diagnose/soh", json=valid_data, headers=headers)
    print("SOH Response:", response.json())  # Print API response
    assert response.status_code == 200
    assert "stateOfHealth" in response.json()

def test_resistance_endpoint():
    """Test Internal Resistance endpoint"""
    headers = {"x-api-key": "test_key"}

    valid_data = {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "current": 1.0,
        "temperature": 25.0
    }
    response = client.post("/battery/diagnose/resistance", json=valid_data, headers=headers)
    print("Resistance Response:", response.json())  # Print API response
    assert response.status_code == 200
    assert "internalResistance" in response.json()

def test_diagnostic_history():
    """Test diagnostic history endpoint"""
    headers = {"x-api-key": "test_key"}

    # First make a diagnostic request
    soc_data = {
        "batteryType": "Li-ion",
        "voltage": 11.1,
        "temperature": 27.0,
        "nominalVoltage": 12.0
    }
    client.post("/battery/diagnose/soc", json=soc_data, headers=headers)

    # Then check history
    response = client.get("/battery/logs", headers=headers)
    print("Diagnostic History Response:", response.json())  # Print API response
    assert response.status_code == 200
    assert "logs" in response.json()
    assert len(response.json()["logs"]) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
