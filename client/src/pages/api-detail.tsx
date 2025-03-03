import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Battery, Terminal, Database } from "lucide-react";
import { useState } from "react";

const API_DETAILS = {
  "voltage": {
    name: "Voltage Analysis API",
    version: "v1",
    description: "Monitor and analyze battery voltage levels",
    endpoint: "/api/v1/diagnostics/voltage",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/voltage" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "voltage": 3.7,
  "cellCount": 4
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "voltage", type: "number", description: "Current battery voltage (V)" },
      { name: "cellCount", type: "integer", description: "Number of cells in series" }
    ],
    responseParameters: [
      { name: "nominalVoltage", description: "Standard operating voltage for the battery chemistry" },
      { name: "maxVoltage", description: "Maximum safe charging voltage" },
      { name: "minVoltage", description: "Minimum safe discharge voltage" },
      { name: "status", description: "Voltage status (Normal, High, Low)" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Voltage out of range" },
      { code: "E003", description: "Invalid cell count" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "cellCount": 4
    },
    responseExample: {
        "nominalVoltage": 3.7,
        "maxVoltage": 4.2,
        "minVoltage": 3.2,
        "status": "Normal"
    }
  },
  "soc": {
    name: "State of Charge API",
    version: "v1",
    description: "Calculate real-time battery charge levels using voltage-based SOC estimation",
    endpoint: "/api/v1/diagnostics/soc",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/soc" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "voltage": 3.7,
  "temperature": 25
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "voltage", type: "number", description: "Current battery voltage (V)" },
      { name: "temperature", type: "number", description: "Battery temperature (°C)" }
    ],
    responseParameters: [
      { name: "stateOfCharge", description: "Current battery charge level (0-100%)" },
      { name: "estimatedRange", description: "Estimated range based on current charge" },
      { name: "chargingStatus", description: "Current charging status (Charging, Discharging, Full)" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Voltage out of range" },
      { code: "E003", description: "Temperature out of range" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "temperature": 25
    },
    responseExample: {
        "stateOfCharge": 85,
        "estimatedRange": 150,
        "chargingStatus": "Discharging"
    }
  },
  "soh": {
    name: "State of Health API",
    version: "v1",
    description: "Determine battery health status by comparing current vs rated capacity",
    endpoint: "/api/v1/diagnostics/soh",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/soh" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "currentCapacity": 2800,
  "ratedCapacity": 3000,
  "cycleCount": 250
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "currentCapacity", type: "number", description: "Current measured capacity (mAh)" },
      { name: "ratedCapacity", type: "number", description: "Original rated capacity (mAh)" },
      { name: "cycleCount", type: "integer", description: "Number of charge cycles completed" }
    ],
    responseParameters: [
      { name: "stateOfHealth", description: "Battery health percentage (0-100%)" },
      { name: "capacityLoss", description: "Percentage of capacity lost" },
      { name: "healthStatus", description: "Qualitative health status (Good, Fair, Poor)" },
      { name: "recommendedAction", description: "Suggested maintenance action" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Invalid capacity values" },
      { code: "E003", description: "Cycle count out of range" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "currentCapacity": 2800,
        "ratedCapacity": 3000,
        "cycleCount": 250
    },
    responseExample: {
        "stateOfHealth": 93,
        "capacityLoss": 7,
        "healthStatus": "Good",
        "recommendedAction": "None"
    }
  },
  "resistance": {
    name: "Internal Resistance API",
    version: "v1",
    description: "Measure battery internal resistance for performance analysis",
    endpoint: "/api/v1/diagnostics/resistance",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/resistance" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "voltage": 3.7,
  "current": 1.0,
  "temperature": 25
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "voltage", type: "number", description: "Battery voltage under load (V)" },
      { name: "current", type: "number", description: "Load current (A)" },
      { name: "temperature", type: "number", description: "Battery temperature (°C)" }
    ],
    responseParameters: [
      { name: "internalResistance", description: "Calculated internal resistance (mΩ)" },
      { name: "resistanceStatus", description: "Resistance level assessment" },
      { name: "powerLoss", description: "Estimated power loss due to internal resistance" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Invalid measurement values" },
      { code: "E003", description: "Temperature out of range" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "current": 1.0,
        "temperature": 25
    },
    responseExample: {
        "internalResistance": 15,
        "resistanceStatus": "Normal",
        "powerLoss": 0.05
    }
  },
  "capacity-fade": {
    name: "Capacity Fade Analysis API",
    version: "v1",
    description: "Track capacity degradation over time and usage cycles",
    endpoint: "/api/v1/diagnostics/capacity-fade",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/capacity-fade" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "initialCapacity": 3000,
  "currentCapacity": 2700,
  "cycleCount": 300,
  "timeInService": 365
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄)" },
      { name: "initialCapacity", type: "number", description: "Initial battery capacity (mAh)" },
      { name: "currentCapacity", type: "number", description: "Current battery capacity (mAh)" },
      { name: "cycleCount", type: "integer", description: "Number of charge cycles" },
      { name: "timeInService", type: "integer", description: "Days in service" }
    ],
    responseParameters: [
      { name: "capacityFade", description: "Percentage of capacity lost over time" },
      { name: "fadeRate", description: "Rate of capacity loss per cycle" },
      { name: "projectedLifetime", description: "Estimated remaining lifetime" },
      { name: "recommendedAction", description: "Maintenance recommendations" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Invalid capacity values" },
      { code: "E003", description: "Invalid service time" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "initialCapacity": 3000,
        "currentCapacity": 2700,
        "cycleCount": 300,
        "timeInService": 365
    },
    responseExample: {
        "capacityFade": 10,
        "fadeRate": 0.03,
        "projectedLifetime": 1000,
        "recommendedAction": "Monitor closely"
    }
  },
  "cell-balance": {
    name: "Cell Imbalance Detection API",
    version: "v1",
    description: "Monitor individual cell voltages and detect dangerous imbalances",
    endpoint: "/api/v1/diagnostics/cell-balance",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/cell-balance" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "cellVoltages": [3.9, 3.85, 3.92, 3.88],
  "temperature": 25
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄)" },
      { name: "cellVoltages", type: "array", description: "Array of individual cell voltages" },
      { name: "temperature", type: "number", description: "Battery temperature (°C)" }
    ],
    responseParameters: [
      { name: "maxImbalance", description: "Maximum voltage difference between cells" },
      { name: "balanceStatus", description: "Cell balance status assessment" },
      { name: "problematicCells", description: "Identification of cells needing attention" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Invalid cell voltage readings" },
      { code: "E003", description: "Temperature out of range" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "cellVoltages": [3.9, 3.85, 3.92, 3.88],
        "temperature": 25
    },
    responseExample: {
        "maxImbalance": 0.07,
        "balanceStatus": "Good",
        "problematicCells": []
    }
  },
  "cycle-life": {
    name: "Cycle Life Estimation API",
    version: "v1",
    description: "Predict remaining battery life based on degradation patterns",
    endpoint: "/api/v1/diagnostics/cycle-life",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/cycle-life" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "cycleCount": 500,
  "depthOfDischarge": 80,
  "averageTemperature": 25,
  "currentSOH": 90
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "cycleCount", type: "integer", description: "Current cycle count" },
      { name: "depthOfDischarge", type: "number", description: "Average depth of discharge (%)" },
      { name: "averageTemperature", type: "number", description: "Average operating temperature (°C)" },
      { name: "currentSOH", type: "number", description: "Current state of health (%)" }
    ],
    responseParameters: [
      { name: "remainingCycles", description: "Estimated remaining cycle life" },
      { name: "estimatedEOL", description: "Predicted end-of-life date" },
      { name: "confidenceLevel", description: "Prediction confidence percentage" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Invalid cycle parameters" },
      { code: "E003", description: "Temperature out of range" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "cycleCount": 500,
        "depthOfDischarge": 80,
        "averageTemperature": 25,
        "currentSOH": 90
    },
    responseExample: {
        "remainingCycles": 1000,
        "estimatedEOL": "2026-03-15",
        "confidenceLevel": 95
    }
  },
  "safety-monitor": {
    name: "Safety Monitoring API",
    version: "v1",
    description: "Real-time monitoring of voltage, temperature, and current for safety risks",
    endpoint: "/api/v1/diagnostics/safety",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/safety" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "voltage": 3.7,
  "current": 2.0,
  "temperature": 35,
  "pressure": 1.0
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "voltage", type: "number", description: "Battery voltage (V)" },
      { name: "current", type: "number", description: "Current flow (A)" },
      { name: "temperature", type: "number", description: "Battery temperature (°C)" },
      { name: "pressure", type: "number", description: "Internal pressure (atm)" }
    ],
    responseParameters: [
      { name: "safetyStatus", description: "Overall safety assessment" },
      { name: "riskLevel", description: "Calculated risk level (Low, Medium, High)" },
      { name: "warningFlags", description: "Active safety warnings" },
      { name: "recommendedActions", description: "Safety recommendations" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Parameters out of safe range" },
      { code: "E003", description: "Critical safety violation" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "current": 2.0,
        "temperature": 35,
        "pressure": 1.0
    },
    responseExample: {
        "safetyStatus": "Safe",
        "riskLevel": "Low",
        "warningFlags": [],
        "recommendedActions": []
    }
  },
  "thermal-analysis": {
    name: "Thermal Analysis API",
    version: "v1",
    description: "Temperature monitoring and thermal runaway risk detection",
    endpoint: "/api/v1/diagnostics/thermal",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/thermal" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "temperature": 35,
  "rateOfChange": 0.5,
  "ambientTemperature": 25,
  "loadProfile": "high"
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄)" },
      { name: "temperature", type: "number", description: "Current temperature (°C)" },
      { name: "rateOfChange", type: "number", description: "Temperature change rate (°C/min)" },
      { name: "ambientTemperature", type: "number", description: "Ambient temperature (°C)" },
      { name: "loadProfile", type: "string", description: "Current load profile (low/medium/high)" }
    ],
    responseParameters: [
      { name: "thermalStatus", description: "Current thermal condition assessment" },
      { name: "runawayRisk", description: "Thermal runaway risk percentage" },
      { name: "coolingNeeded", description: "Required cooling action" },
      { name: "temperatureMargin", description: "Margin to thermal limits" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Temperature out of range" },
      { code: "E003", description: "Invalid load profile" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "temperature": 35,
        "rateOfChange": 0.5,
        "ambientTemperature": 25,
        "loadProfile": "high"
    },
    responseExample: {
        "thermalStatus": "Normal",
        "runawayRisk": 2,
        "coolingNeeded": "None",
        "temperatureMargin": 15
    }
  },
  "fault-detection": {
    name: "Fault Detection API",
    version: "v1",
    description: "Detect and diagnose battery faults including internal damage and reverse current",
    endpoint: "/api/v1/diagnostics/faults",
    curl: `curl -X "POST" \\
"https://api.batteryos.com/api/v1/diagnostics/faults" \\
-H "accept: */*" \\
-H "x-api-key: YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "batteryType": "Li-ion",
  "voltage": 3.7,
  "current": -0.1,
  "temperature": 40,
  "impedance": 150
}'`,
    inputAttributes: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "voltage", type: "number", description: "Battery voltage (V)" },
      { name: "current", type: "number", description: "Current flow (A)" },
      { name: "temperature", type: "number", description: "Battery temperature (°C)" },
      { name: "impedance", type: "number", description: "Internal impedance (mΩ)" }
    ],
    responseParameters: [
      { name: "faultStatus", description: "Detected fault conditions" },
      { name: "faultType", description: "Classification of detected faults" },
      { name: "severity", description: "Fault severity level" },
      { name: "recommendedActions", description: "Suggested corrective actions" }
    ],
    statusCodes: [
      { code: "200", description: "OK" },
      { code: "400", description: "Bad Request" },
      { code: "401", description: "Unauthorized" },
      { code: "500", description: "Internal Server Error" }
    ],
    errorCodes: [
      { code: "E001", description: "Invalid battery type" },
      { code: "E002", description: "Invalid measurement values" },
      { code: "E003", description: "Critical fault detected" }
    ],
    requestExample: {
        "batteryType": "Li-ion",
        "voltage": 3.7,
        "current": -0.1,
        "temperature": 40,
        "impedance": 150
    },
    responseExample: {
        "faultStatus": "Reverse Current",
        "faultType": "Electrical",
        "severity": "High",
        "recommendedActions": ["Inspect wiring", "Check for shorts"]
    }
  }
};

export default function ApiDetail() {
  const { endpoint } = useParams();
  const [version, setVersion] = useState("v1");
  const [activeTab, setActiveTab] = useState("curl");

  const apiInfo = API_DETAILS[endpoint as keyof typeof API_DETAILS];

  if (!apiInfo) {
    return <div>API not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {apiInfo.name}
            </h1>
            <p className="text-muted-foreground">
              {apiInfo.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">API Version</span>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger className="w-32 bg-background border-border/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">Version 1.0</SelectItem>
                <SelectItem value="v2">Version 2.0</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="mb-8 border-border/40 bg-background/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <Terminal className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Try API</h2>
              <Button className="ml-auto bg-primary hover:bg-primary/90">
                Try Now
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="curl" className="data-[state=active]:bg-background">cURL</TabsTrigger>
                <TabsTrigger value="request" className="data-[state=active]:bg-background">Request JSON</TabsTrigger>
                <TabsTrigger value="response" className="data-[state=active]:bg-background">Response</TabsTrigger>
              </TabsList>
              <TabsContent value="curl">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm">
                    {apiInfo.curl}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="request">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm">
                    {JSON.stringify(apiInfo.requestExample, null, 2)}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="response">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm">
                    {JSON.stringify(apiInfo.responseExample, null, 2)}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* API Endpoint section - Updated with complete URLs */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">API Endpoint</h2>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>API Endpoint : </span>
              <code className="font-mono bg-background px-2 py-1 rounded">
                https://api.batteryos.com{apiInfo.endpoint}
              </code>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Battery className="h-6 w-6 text-primary" />
              Input Attributes
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full border-collapse bg-background/50">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left p-4 text-muted-foreground">Attribute</th>
                    <th className="text-left p-4 text-muted-foreground">Data Type</th>
                    <th className="text-left p-4 text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {apiInfo.inputAttributes.map((attr) => (
                    <tr key={attr.name} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-mono text-sm">{attr.name}</td>
                      <td className="p-4 text-primary/80">{attr.type}</td>
                      <td className="p-4 text-muted-foreground">{attr.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              Response Parameters
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full border-collapse bg-background/50">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left p-4 text-muted-foreground">Attribute</th>
                    <th className="text-left p-4 text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {apiInfo.responseParameters.map((param) => (
                    <tr key={param.name} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-mono text-sm">{param.name}</td>
                      <td className="p-4 text-muted-foreground">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Response Codes</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary/80">HTTP Status Codes</h3>
                <div className="overflowx-auto rounded-lg border border-border/40">
                  <table className="w-full border-collapse bg-background/50">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left p-4 text-muted-foreground">Code</th>
                        <th className="text-left p-4 text-muted-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {apiInfo.statusCodes.map((status) => (
                        <tr key={status.code} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-mono text-sm">{status.code}</td>
                          <td className="p-4 text-muted-foreground">{status.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary/80">API Error Codes</h3>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full border-collapse bg-background/50">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left p-4 text-muted-foreground">Code</th>
                        <th className="text-left p-4 text-muted-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {apiInfo.errorCodes.map((error) => (
                        <tr key={error.code} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-mono text-sm">{error.code}</td>
                          <td className="p-4 text-muted-foreground">{error.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}