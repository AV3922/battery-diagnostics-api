from fastapi.testclient import TestClient
from main import app
import pytest
import json

client = TestClient(app)


def test_health_endpoints():
    """Test base endpoints"""
    print("\n===========================================================")
    print("TEST: Health Endpoints")
    print("===========================================================")

    # Test root endpoint
    print("\n=== ROOT ENDPOINT ===")
    response = client.get("/")
    print(f"Request: GET /")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "online"
    print("RESULT: PASSED ✓")

    # Test health endpoint
    print("\n=== HEALTH ENDPOINT ===")
    print(f"Request: GET /health")
    response = client.get("/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    print("RESULT: PASSED ✓")


def test_soc_endpoint():
    """Test State of Charge endpoint"""
    print("\n===========================================================")
    print("TEST: State of Charge (SOC) Endpoint")
    print("===========================================================")

    headers = {"x-api-key": "test_key"}

    # Test valid request with valid nominal voltage
    valid_data = {
        "batteryType": "Li-ion",
        "voltage": 53.7,
        "temperature": 35.0,
        "nominalVoltage": 48
    }
    print("\n=== SOC ENDPOINT (VALID) ===")
    print(f"Request: POST /battery/diagnose/soc")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Request Body: {json.dumps(valid_data, indent=2)}")

    response = client.post("/battery/diagnose/soc",
                           json=valid_data,
                           headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "stateOfCharge" in response.json()
    print("RESULT: PASSED ✓")

    # Test with invalid nominal voltage
    invalid_voltage_data = {
        "batteryType": "Li-ion",
        "voltage": 10.0,
        "temperature": 27.0,
        "nominalVoltage": 10.5  # Not a predefined value
    }
    print("\n=== SOC ENDPOINT (INVALID NOMINAL VOLTAGE) ===")
    print(f"Request: POST /battery/diagnose/soc")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Request Body: {json.dumps(invalid_voltage_data, indent=2)}")

    response = client.post("/battery/diagnose/soc",
                           json=invalid_voltage_data,
                           headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    assert response.status_code == 400
    print("RESULT: PASSED ✓")

    # Test invalid battery type
    invalid_data = {
        "batteryType": "Invalid",
        "voltage": 3.7,
        "temperature": 25.0,
        "nominalVoltage": 3.6
    }
    print("\n=== SOC ENDPOINT (INVALID BATTERY TYPE) ===")
    print(f"Request: POST /battery/diagnose/soc")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Request Body: {json.dumps(invalid_data, indent=2)}")

    response = client.post("/battery/diagnose/soc",
                           json=invalid_data,
                           headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    assert response.status_code == 422
    print("RESULT: PASSED ✓")


def test_soh_endpoint():
    """Test State of Health endpoint"""
    print("\n===========================================================")
    print("TEST: State of Health (SOH) Endpoint")
    print("===========================================================")

    headers = {"x-api-key": "test_key"}

    # Test valid request
    valid_data = {
        "batteryType": "Li-ion",
        "currentCapacity": 3500,
        "ratedCapacity": 3000,
        "cycleCount": 250
    }
    print("\n=== SOH ENDPOINT (VALID) ===")
    print(f"Request: POST /battery/diagnose/soh")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Request Body: {json.dumps(valid_data, indent=2)}")

    response = client.post("/battery/diagnose/soh",
                           json=valid_data,
                           headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "stateOfHealth" in response.json()
    print("RESULT: PASSED ✓")

    # Test invalid capacity
    invalid_data = {
        "batteryType": "Li-ion",
        "currentCapacity": -100,  # Invalid negative capacity
        "ratedCapacity": 3000,
        "cycleCount": 250
    }
    print("\n=== SOH ENDPOINT (INVALID CAPACITY) ===")
    print(f"Request: POST /battery/diagnose/soh")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Request Body: {json.dumps(invalid_data, indent=2)}")

    response = client.post("/battery/diagnose/soh",
                           json=invalid_data,
                           headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    assert response.status_code == 422
    print("RESULT: PASSED ✓")


def test_resistance_endpoint():
    """Test Internal Resistance endpoint"""
    print("\n===========================================================")
    print("TEST: Internal Resistance Endpoint")
    print("===========================================================")

    headers = {"x-api-key": "test_key"}

    # Test valid request
    valid_data = {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "current": 1.0,
        "temperature": 25.0
    }
    print("\n=== RESISTANCE ENDPOINT (VALID) ===")
    print(f"Request: POST /battery/diagnose/resistance")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Request Body: {json.dumps(valid_data, indent=2)}")

    response = client.post("/battery/diagnose/resistance",
                           json=valid_data,
                           headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "internalResistance" in response.json()
    print("RESULT: PASSED ✓")


def test_api_key_validation():
    """Test API key validation"""
    print("\n===========================================================")
    print("TEST: API Key Validation")
    print("===========================================================")

    # Test missing API key
    request_data = {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "temperature": 25.0,
        "nominalVoltage": 3.7
    }
    print("\n=== API KEY VALIDATION (MISSING) ===")
    print(f"Request: POST /battery/diagnose/soc")
    print(f"Headers: No API Key")
    print(f"Request Body: {json.dumps(request_data, indent=2)}")

    response = client.post("/battery/diagnose/soc", json=request_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    assert response.status_code == 422  # FastAPI validation error for missing header
    print("RESULT: PASSED ✓")


def test_diagnostic_history():
    """Test diagnostic history endpoint"""
    print("\n===========================================================")
    print("TEST: Diagnostic History Endpoint")
    print("===========================================================")

    headers = {"x-api-key": "test_key"}

    # First make a diagnostic request
    soc_data = {
        "batteryType": "Li-ion",
        "voltage": 11.1,
        "temperature": 27.0,
        "nominalVoltage": 12.0
    }
    print("\n=== MAKING DIAGNOSTIC REQUEST ===")
    print(f"Request: POST /battery/diagnose/soc")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print(f"Request Body: {json.dumps(soc_data, indent=2)}")

    client.post("/battery/diagnose/soc", json=soc_data, headers=headers)

    # Then check history
    print("\n=== DIAGNOSTIC HISTORY ===")
    print(f"Request: GET /battery/logs")
    print(f"Headers: {json.dumps(headers, indent=2)}")

    response = client.get("/battery/logs", headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "logs" in response.json()
    assert len(response.json()["logs"]) > 0
    print("RESULT: PASSED ✓")


if __name__ == "__main__":
    print("\n===== RUNNING API TESTS =====")
    # Run pytest with -v (verbose) and -s (show print statements) flags
    pytest.main([__file__, "-v", "-s"])
