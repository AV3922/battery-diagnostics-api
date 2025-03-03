
# Battery OS API Structure

## Root Endpoints

- `/` - Root endpoint
  - **Method**: GET
  - **Response**: Basic API information

- `/health` - Health check endpoint
  - **Method**: GET
  - **Response**: 
    ```json
    {
      "status": "healthy",
      "timestamp": "2023-06-01T12:00:00.000Z",
      "version": "1.0.0",
      "server": "FastAPI"
    }
    ```

- `/api-list` - Lists all available diagnostic parameters
  - **Method**: GET
  - **Response**: List of all available API endpoints

- `/api-detail/{parameter}` - Get detailed API documentation
  - **Method**: GET
  - **Path Parameter**: parameter (string)
  - **Response**: Detailed documentation for specified parameter

## Battery Diagnostic Endpoints

### State of Charge (SOC)

- `/battery/diagnose/soc` - Calculate State of Charge
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion_24V",
      "voltage": 25.2,
      "temperature": 25
    }
    ```
  - **Output**:
    ```json
    {
      "stateOfCharge": 85.5,
      "estimatedRange": "68 km",
      "chargingStatus": "Charging",
      "temperatureCompensation": 1.0
    }
    ```

### State of Health (SOH)

- `/battery/diagnose/soh` - Calculate State of Health
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion",
      "currentCapacity": 2800,
      "ratedCapacity": 3000,
      "cycleCount": 250
    }
    ```
  - **Output**:
    ```json
    {
      "stateOfHealth": 93,
      "capacityLoss": 7,
      "healthStatus": "Good",
      "recommendedAction": "Regular maintenance sufficient"
    }
    ```

### Internal Resistance

- `/battery/diagnose/resistance` - Measure internal resistance
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion",
      "voltage": 3.7,
      "current": 1.0,
      "temperature": 25
    }
    ```
  - **Output**:
    ```json
    {
      "internalResistance": 15,
      "resistanceStatus": "Normal",
      "powerLoss": "Minimal"
    }
    ```

### Capacity Fade Analysis

- `/battery/diagnose/capacity-fade` - Analyze capacity fade
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion",
      "initialCapacity": 3000,
      "currentCapacity": 2700,
      "cycleCount": 300,
      "timeInService": 365
    }
    ```
  - **Output**:
    ```json
    {
      "capacityFade": 10,
      "fadeRate": 0.03,
      "projectedLifetime": "1000 days",
      "recommendedAction": "Monitor closely"
    }
    ```

### Cell Balance

- `/battery/diagnose/cell-balance` - Monitor cell voltage balance
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion",
      "cellVoltages": [3.9, 3.85, 3.92, 3.88],
      "temperature": 25
    }
    ```
  - **Output**:
    ```json
    {
      "maxImbalance": 0.07,
      "balanceStatus": "Acceptable",
      "problematicCells": []
    }
    ```

### Cycle Life Estimation

- `/battery/diagnose/cycle-life` - Predict remaining battery life
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion",
      "cycleCount": 500,
      "depthOfDischarge": 80,
      "averageTemperature": 25,
      "currentSOH": 90
    }
    ```
  - **Output**:
    ```json
    {
      "remainingCycles": 1550,
      "estimatedEOL": "2025-06-15",
      "confidenceLevel": 85
    }
    ```

### Safety Monitoring

- `/battery/diagnose/safety` - Monitor battery safety parameters
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion",
      "voltage": 3.7,
      "current": 2.0,
      "temperature": 35,
      "pressure": 1.0
    }
    ```
  - **Output**:
    ```json
    {
      "safetyStatus": "Normal",
      "riskLevel": "Low",
      "warningFlags": [],
      "recommendedActions": ["Continue normal operation"]
    }
    ```

### Thermal Analysis

- `/battery/diagnose/thermal` - Analyze thermal conditions
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion",
      "temperature": 35,
      "rateOfChange": 0.5,
      "ambientTemperature": 25,
      "loadProfile": "high"
    }
    ```
  - **Output**:
    ```json
    {
      "thermalStatus": "Normal",
      "runawayRisk": 25,
      "coolingNeeded": "Normal cooling sufficient",
      "temperatureMargin": 25
    }
    ```

### Fault Detection

- `/battery/diagnose/faults` - Detect and diagnose battery faults
  - **Method**: POST
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion",
      "voltage": 3.7,
      "current": 1.0,
      "temperature": 25,
      "impedance": 15
    }
    ```
  - **Output**:
    ```json
    {
      "faultStatus": "Normal",
      "faultType": null,
      "severity": "Normal",
      "recommendedActions": ["Monitor battery parameters"]
    }
    ```

### Battery Test History

- `/battery/logs` - Retrieve battery test history
  - **Method**: GET
  - **Query Parameters**: 
    - `batteryId` (optional): Filter by battery ID
    - `startDate` (optional): Filter by start date
    - `endDate` (optional): Filter by end date
  - **Response**: Array of diagnostic results

## Express API Endpoints

### User Management

- `/api/users` - Create new user
  - **Method**: POST
  - **Input**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com"
    }
    ```
  - **Output**:
    ```json
    {
      "apiKey": "usr_abc123def456"
    }
    ```

### Diagnostics Management

- `/api/diagnostics` - Create diagnostic record
  - **Method**: POST
  - **Headers**: `x-api-key: YOUR_API_KEY`
  - **Input**:
    ```json
    {
      "batteryType": "Li-ion_48V",
      "voltage": 51.2,
      "temperature": 30,
      "current": 2.5,
      "capacity": 45000,
      "cycleCount": 120
    }
    ```
  - **Output**: Diagnostic result object

- `/api/diagnostics` - Get diagnostics for user
  - **Method**: GET
  - **Headers**: `x-api-key: YOUR_API_KEY`
  - **Output**: Array of user's diagnostic records
