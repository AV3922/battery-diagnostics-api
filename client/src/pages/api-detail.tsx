import { useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const API_DETAILS = {
  "voltage": {
    name: "Voltage Analysis",
    description: "Monitor and analyze battery voltage levels for different chemistries",
    endpoint: "/api/diagnostics/voltage",
    parameters: [
      { name: "batteryType", type: "string", description: "Battery chemistry (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "voltage", type: "number", description: "Current battery voltage (V)" },
      { name: "cellCount", type: "number", description: "Number of cells in series" },
    ],
    technicalDetails: {
      title: "Voltage Specifications",
      content: `
• Li-ion: Nominal 3.7V/cell, Vmax 4.2V, Vmin 3.0V
• LiFePO₄: Nominal 3.2V/cell, Vmax 3.65V, Vmin 2.5V
• Lead-acid: Nominal 2.0V/cell, Vmax 2.4V, Vmin 1.75V
      `
    }
  },
  "soc": {
    name: "State of Charge",
    description: "Calculate real-time battery charge levels",
    endpoint: "/api/diagnostics/soc",
    parameters: [
      { name: "batteryType", type: "string", description: "Battery chemistry type" },
      { name: "voltage", type: "number", description: "Current voltage (V)" },
      { name: "temperature", type: "number", description: "Battery temperature (°C)" },
    ],
    technicalDetails: {
      title: "SOC Calculation",
      content: `
SOC (%) = [(V - Vmin) / (Vmax - Vmin)] * 100

Where:
• V = Current voltage
• Vmin = Minimum safe voltage
• Vmax = Maximum safe voltage
      `
    }
  },
  "soh": {
    name: "State of Health",
    description: "Determine battery health and remaining capacity",
    endpoint: "/api/diagnostics/soh",
    parameters: [
      { name: "batteryType", type: "string", description: "Battery chemistry type" },
      { name: "currentCapacity", type: "number", description: "Current capacity (Ah)" },
      { name: "ratedCapacity", type: "number", description: "Rated capacity (Ah)" },
    ],
    technicalDetails: {
      title: "SOH Calculation",
      content: `
SOH (%) = (Current Capacity / Rated Capacity) * 100

Degradation Categories:
• 100-80%: Good condition
• 80-60%: Moderate wear
• <60%: Significant degradation
      `
    }
  },
  "thermal-analysis": {
    name: "Thermal Analysis",
    description: "Monitor temperature and detect thermal risks",
    endpoint: "/api/diagnostics/thermal",
    parameters: [
      { name: "batteryType", type: "string", description: "Battery chemistry type" },
      { name: "temperature", type: "number", description: "Battery temperature (°C)" },
      { name: "rateOfChange", type: "number", description: "Temperature change rate (°C/min)" },
    ],
    technicalDetails: {
      title: "Thermal Risk Assessment",
      content: `
Risk Levels:
• Safe: <45°C
• Warning: 45-60°C
• Critical: >60°C
• Thermal Runaway Risk: >70°C and rising rapidly

Detection Logic:
if (temp > 70 && rateOfChange > 2°C/min) {
    risk = "Thermal Runaway Imminent"
}
      `
    }
  },
  "fault-detection": {
    name: "Fault Detection",
    description: "Detect and diagnose battery faults",
    endpoint: "/api/diagnostics/faults",
    parameters: [
      { name: "batteryType", type: "string", description: "Battery chemistry type" },
      { name: "voltage", type: "number", description: "Current voltage (V)" },
      { name: "current", type: "number", description: "Current flow (A)" },
      { name: "temperature", type: "number", description: "Temperature (°C)" },
    ],
    technicalDetails: {
      title: "Fault Detection Logic",
      content: `
Fault Conditions:
1. Short Circuit:
   • Sudden voltage drop >50%
   • High current spike

2. Internal Damage:
   • SOH drop >5% in 10 cycles
   • Abnormal internal resistance

3. Reverse Current:
   • Charging current < 0
   • Voltage polarity reversal
      `
    }
  }
};

export default function ApiDetail() {
  const { endpoint } = useParams();
  const [apiKey, setApiKey] = useState("");
  const [response, setResponse] = useState("");

  const apiInfo = API_DETAILS[endpoint as keyof typeof API_DETAILS];

  if (!apiInfo) {
    return <div>API not found</div>;
  }

  const testApi = async () => {
    try {
      const res = await fetch(apiInfo.endpoint, {
        headers: {
          "x-api-key": apiKey,
        },
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse("Error: " + (err as Error).message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{apiInfo.name}</h1>
      <p className="text-lg text-muted-foreground mb-8">{apiInfo.description}</p>

      <Tabs defaultValue="docs">
        <TabsList>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="test">Test API</TabsTrigger>
        </TabsList>

        <TabsContent value="docs">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">Parameters</h3>
                <ul className="space-y-4">
                  {apiInfo.parameters.map(param => (
                    <li key={param.name}>
                      <div className="font-medium">{param.name}</div>
                      <div className="text-sm text-muted-foreground">Type: {param.type}</div>
                      <div className="text-sm">{param.description}</div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{apiInfo.technicalDetails.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {apiInfo.technicalDetails.content}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                </div>

                <Button onClick={testApi}>Send Request</Button>

                {response && (
                  <pre className="mt-4 p-4 bg-muted rounded-lg overflow-auto">
                    {response}
                  </pre>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}