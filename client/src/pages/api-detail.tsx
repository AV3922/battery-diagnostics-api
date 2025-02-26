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
    endpoint: "/api/diagnostics/voltage",
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
            </Tabs>

            <div className="mt-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {apiInfo.endpoint}
              </code>
            </div>
          </CardContent>
        </Card>

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
                <div className="overflow-x-auto rounded-lg border border-border/40">
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