import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  AlertTriangle, 
  BellRing, 
  Thermometer, 
  Battery, 
  Zap,
  Activity,
  Check,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { queryClient } from "@/lib/queryClient";

export default function AlertSettings() {
  const [selectedParameter, setSelectedParameter] = useState("voltage");
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [severity, setSeverity] = useState("warning");
  const [notificationMethod, setNotificationMethod] = useState("dashboard");

  // Fetch existing alert thresholds
  const { data: thresholds } = useQuery({
    queryKey: ["/api/v1/alert-thresholds"],
    queryFn: async () => {
      const response = await fetch("/api/v1/alert-thresholds");
      return response.json();
    }
  });

  // Fetch alert history
  const { data: alertHistory } = useQuery({
    queryKey: ["/api/v1/alert-history"],
    queryFn: async () => {
      const response = await fetch("/api/v1/alert-history");
      return response.json();
    }
  });

  const handleSaveThreshold = async () => {
    try {
      const response = await fetch("/api/v1/alert-thresholds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parameterName: selectedParameter,
          minValue,
          maxValue,
          severity,
          notificationMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save threshold");
      }

      // Invalidate and refetch thresholds
      queryClient.invalidateQueries({ queryKey: ["/api/v1/alert-thresholds"] });
    } catch (error) {
      console.error("Error saving threshold:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Alert Settings</h1>
          <p className="text-muted-foreground mt-2">Configure battery performance thresholds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alert Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Configure New Alert
            </CardTitle>
            <CardDescription>Set thresholds for battery parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Parameter</label>
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voltage">Voltage</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="stateOfCharge">State of Charge</SelectItem>
                  <SelectItem value="stateOfHealth">State of Health</SelectItem>
                  <SelectItem value="internalResistance">Internal Resistance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Threshold Range</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Min Value</span>
                  <Input
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(Number(e.target.value))}
                  />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Max Value</span>
                  <Input
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Method</label>
              <Select value={notificationMethod} onValueChange={setNotificationMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleSaveThreshold}>
              Save Alert Threshold
            </Button>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>Currently triggered alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertHistory?.slice(0, 5).map((alert: any) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    {alert.severity === 'critical' ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <BellRing className="h-5 w-5 text-warning" />
                    )}
                    <div>
                      <p className="font-medium">{alert.parameterName}</p>
                      <p className="text-sm text-muted-foreground">
                        Value: {alert.value} | {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Threshold List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Configured Thresholds
            </CardTitle>
            <CardDescription>List of all configured alert thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {thresholds?.map((threshold: any) => (
                <div
                  key={threshold.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {threshold.parameterName === 'voltage' && <Battery className="h-5 w-5 text-primary" />}
                      {threshold.parameterName === 'temperature' && <Thermometer className="h-5 w-5 text-primary" />}
                      {threshold.parameterName === 'stateOfCharge' && <Zap className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium">{threshold.parameterName}</p>
                      <p className="text-sm text-muted-foreground">
                        Range: {threshold.minValue} - {threshold.maxValue}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">Edit</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Edit Threshold</AlertDialogTitle>
                          <AlertDialogDescription>
                            Make changes to this alert threshold.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        {/* Add edit form here */}
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Save Changes</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}