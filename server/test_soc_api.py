
import requests
import json

# API endpoint (make sure the server is running)
url = "http://0.0.0.0:5000/battery/diagnose/soc"

# Test data according to SOCRequest model requirements
test_data = {
    "batteryType": "Li-ion",
    "nominalVoltage": 24.0,
    "voltage": 25.2, 
    "temperature": 25
}

# Send the request
response = requests.post(url, json=test_data)

# Print the results
print(f"Status Code: {response.status_code}")
if response.status_code == 200:
    print("Response:")
    print(json.dumps(response.json(), indent=4))
else:
    print(f"Error: {response.text}")
