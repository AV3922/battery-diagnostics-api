import { useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const API_DETAILS = {
  "soh": {
    name: "State of Health",
    description: "Calculate battery State of Health (SOH) to determine remaining useful life",
    endpoint: "/api/diagnostics/soh",
    parameters: [
      { name: "batteryType", type: "string", description: "Battery chemistry type (Li-ion, LiFePO₄, Lead-acid)" },
      { name: "voltage", type: "number", description: "Current battery voltage in volts" },
      { name: "capacity", type: "number", description: "Current capacity in Ah" },
    ],
  },
  // Add more API details
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
