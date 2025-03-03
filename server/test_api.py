
from fastapi.testclient import TestClient
from main import app
import pytest
import json

client = TestClient(app)

def test_health_endpoints():
    """Test base endpoints"""
    # Test root endpoint
    response = client.get("/")
    print("\n=== ROOT ENDPOINT ===")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "online"

    # Test health endpoint
    response = client.get("/health")
    print("\n=== HEALTH ENDPOINT ===")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_soc_endpoint():
    """Test State of Charge endpoint"""
    headers = {"x-api-key": "test_key"}

    # Test valid request
    valid_data = {
        "batteryType": "Li-ion",
        "voltage": 11.1,
        "temperature": 27.0,
        "nominalVoltage": 12.0
    }
    print("\n=== SOC ENDPOINT (VALID) ===")
    print(f"Request: {json.dumps(valid_data, indent=2)}")
    response = client.post("/battery/diagnose/soc", 
                         json=valid_data,
                         headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "stateOfCharge" in response.json()

    # Test invalid battery type
    invalid_data = {
        "batteryType": "Invalid",
        "voltage": 3.7,
        "temperature": 25.0,
        "nominalVoltage": 3.6
    }
    print("\n=== SOC ENDPOINT (INVALID) ===")
    print(f"Request: {json.dumps(invalid_data, indent=2)}")
    response = client.post("/battery/diagnose/soc", 
                         json=invalid_data,
                         headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.text, indent=2)}")
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
    print("\n=== SOH ENDPOINT (VALID) ===")
    print(f"Request: {json.dumps(valid_data, indent=2)}")
    response = client.post("/battery/diagnose/soh", 
                         json=valid_data,
                         headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "stateOfHealth" in response.json()

    # Test invalid capacity
    invalid_data = {
        "batteryType": "Li-ion",
        "currentCapacity": -100,  # Invalid negative capacity
        "ratedCapacity": 3000,
        "cycleCount": 250
    }
    print("\n=== SOH ENDPOINT (INVALID) ===")
    print(f"Request: {json.dumps(invalid_data, indent=2)}")
    response = client.post("/battery/diagnose/soh", 
                         json=invalid_data,
                         headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.text, indent=2)}")
    assert response.status_code == 422

def test_resistance_endpoint():
    """Test Internal Resistance endpoint"""
    headers = {"x-api-key": "test_key"}

    # Test valid request
    valid_data = {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "current": 1.0,
        "temperature": 25.0
    }
    print("\n=== RESISTANCE ENDPOINT (VALID) ===")
    print(f"Request: {json.dumps(valid_data, indent=2)}")
    response = client.post("/battery/diagnose/resistance", 
                         json=valid_data,
                         headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "internalResistance" in response.json()

def test_api_key_validation():
    """Test API key validation"""
    # Test missing API key
    request_data = {
        "batteryType": "Li-ion", 
        "voltage": 3.7, 
        "temperature": 25.0,
        "nominalVoltage": 3.7
    }
    print("\n=== API KEY VALIDATION (MISSING) ===")
    print(f"Request: {json.dumps(request_data, indent=2)}")
    response = client.post("/battery/diagnose/soc", json=request_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.text, indent=2)}")
    assert response.status_code == 422  # FastAPI validation error for missing header

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
    print("\n=== MAKING DIAGNOSTIC REQUEST ===")
    client.post("/battery/diagnose/soc", json=soc_data, headers=headers)

    # Then check history
    print("\n=== DIAGNOSTIC HISTORY ===")
    response = client.get("/battery/logs", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "logs" in response.json()
    assert len(response.json()["logs"]) > 0

if __name__ == "__main__":
    print("\n===== RUNNING API TESTS =====")
    pytest.main([__file__, "-v"])
