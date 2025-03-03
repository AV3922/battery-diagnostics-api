from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_health_endpoints():
    """Test base endpoints"""
    # Test root endpoint
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "online"

    # Test health endpoint
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_soc_endpoint():
    """Test State of Charge endpoint"""
    headers = {"x-api-key": "test_key"}

    # Test valid request
    valid_data = {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "temperature": 25
    }
    response = client.post("/battery/diagnose/soc", 
                         json=valid_data,
                         headers=headers)
    assert response.status_code == 200
    assert "stateOfCharge" in response.json()

    # Test invalid battery type
    invalid_data = {
        "batteryType": "Invalid",
        "voltage": 3.7,
        "temperature": 25
    }
    response = client.post("/battery/diagnose/soc", 
                         json=invalid_data,
                         headers=headers)
    assert response.status_code == 422

def test_soh_endpoint():
    """Test State of Health endpoint"""
    headers = {"x-api-key": "test_key"}

    # Test valid request
    valid_data = {
        "batteryType": "Li-ion",
        "currentCapacity": 2800,
        "ratedCapacity": 3000,
        "cycleCount": 250
    }
    response = client.post("/battery/diagnose/soh", 
                         json=valid_data,
                         headers=headers)
    assert response.status_code == 200
    assert "stateOfHealth" in response.json()

    # Test invalid capacity
    invalid_data = {
        "batteryType": "Li-ion",
        "currentCapacity": -100,  # Invalid negative capacity
        "ratedCapacity": 3000,
        "cycleCount": 250
    }
    response = client.post("/battery/diagnose/soh", 
                         json=invalid_data,
                         headers=headers)
    assert response.status_code == 422

def test_resistance_endpoint():
    """Test Internal Resistance endpoint"""
    headers = {"x-api-key": "test_key"}

    # Test valid request
    valid_data = {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "current": 1.0,
        "temperature": 25
    }
    response = client.post("/battery/diagnose/resistance", 
                         json=valid_data,
                         headers=headers)
    assert response.status_code == 200
    assert "internalResistance" in response.json()

def test_api_key_validation():
    """Test API key validation"""
    # Test missing API key
    response = client.post("/battery/diagnose/soc", 
                         json={"batteryType": "Li-ion", "voltage": 3.7, "temperature": 25})
    assert response.status_code == 422  # FastAPI validation error for missing header

def test_diagnostic_history():
    """Test diagnostic history endpoint"""
    headers = {"x-api-key": "test_key"}

    # First make a diagnostic request
    soc_data = {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "temperature": 25
    }
    client.post("/battery/diagnose/soc", json=soc_data, headers=headers)

    # Then check history
    response = client.get("/battery/logs", headers=headers)
    assert response.status_code == 200
    assert "logs" in response.json()
    assert len(response.json()["logs"]) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])