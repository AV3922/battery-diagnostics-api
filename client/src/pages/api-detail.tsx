import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const API_DETAILS = {
  "voltage": {
    name: "Voltage Analysis API",
    version: "v1",
    description: "Monitor and analyze battery voltage levels",
    endpoint: "/api/diagnostics/voltage",
    curl: `curl -X "POST" \\
"https://api.batterydiagnostics.com/api/v1/diagnostics/voltage" \\
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
    ]
  },
  // Add other API endpoints with similar structure
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">{apiInfo.name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">API Version</span>
          <Select value={version} onValueChange={setVersion}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="v1">Version 1.0</SelectItem>
              <SelectItem value="v2">Version 2.0</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <img src="/assets/images/swaggerIcon.png" alt="Swagger" className="w-8 h-8" />
            <h2 className="text-2xl font-semibold">Try API</h2>
            <Button className="ml-auto">Try Now</Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="request">Request JSON</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                {apiInfo.curl}
              </pre>
            </TabsContent>
          </Tabs>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">API Endpoint:</p>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {apiInfo.endpoint}
            </code>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Input Attributes</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-4">Attribute</th>
                  <th className="text-left p-4">Data Type</th>
                  <th className="text-left p-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {apiInfo.inputAttributes.map((attr, index) => (
                  <tr key={attr.name} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="p-4">{attr.name}</td>
                    <td className="p-4">{attr.type}</td>
                    <td className="p-4">{attr.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Response Parameters</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-4">Attribute</th>
                  <th className="text-left p-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {apiInfo.responseParameters.map((param, index) => (
                  <tr key={param.name} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="p-4">{param.name}</td>
                    <td className="p-4">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Response Code & Descriptions</h2>

          <h3 className="text-xl font-semibold mb-2">HTTP Status codes</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-4">Status Code</th>
                  <th className="text-left p-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {apiInfo.statusCodes.map((status, index) => (
                  <tr key={status.code} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="p-4">{status.code}</td>
                    <td className="p-4">{status.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold mb-2">API Error code</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-4">Status Code</th>
                  <th className="text-left p-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {apiInfo.errorCodes.map((error, index) => (
                  <tr key={error.code} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                    <td className="p-4">{error.code}</td>
                    <td className="p-4">{error.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}