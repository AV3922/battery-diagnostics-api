import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Zap, Timer, Thermometer } from "lucide-react";

// Function to fetch battery data
const fetchBatteryData = async () => {
  const response = await fetch("/api/v1/diagnostics/voltage");
  return response.json();
};

// Function to fetch cell voltages
const fetchCellVoltages = async () => {
  const response = await fetch("/api/v1/diagnostics/cell-balance");
  return response.json();
};

// Function to fetch charge history
const fetchChargeHistory = async () => {
  const response = await fetch("/api/v1/diagnostics/history");
  return response.json();
};

export default function Dashboard() {
  const [voltageHistory, setVoltageHistory] = useState<any[]>([]);

  // Real-time voltage data
  const { data: voltageData } = useQuery({
    queryKey: ["/api/v1/diagnostics/voltage"],
    queryFn: fetchBatteryData,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Cell voltages data
  const { data: cellData } = useQuery({
    queryKey: ["/api/v1/diagnostics/cell-balance"],
    queryFn: fetchCellVoltages,
    refetchInterval: 5000,
  });

  // Charge history data
  const { data: historyData } = useQuery({
    queryKey: ["/api/v1/diagnostics/history"],
    queryFn: fetchChargeHistory,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update voltage history
  useEffect(() => {
    if (voltageData) {
      setVoltageHistory(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        voltage: voltageData.voltage,
      }].slice(-20)); // Keep last 20 readings
    }
  }, [voltageData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Battery Monitoring Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Current Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery Voltage</CardTitle>
            <Battery className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voltageData?.voltage || 0}V</div>
            <p className="text-xs text-muted-foreground">
              Nominal: {voltageData?.nominalVoltage || 0}V
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">State of Charge</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voltageData?.stateOfCharge || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Estimated Range: {voltageData?.estimatedRange || 0}km
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cycle Count</CardTitle>
            <Timer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historyData?.cycleCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last Charged: {historyData?.lastCharged || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voltageData?.temperature || 0}°C</div>
            <p className="text-xs text-muted-foreground">
              Status: {voltageData?.temperatureStatus || 'Normal'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Voltage History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Voltage History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={voltageHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cell Voltages */}
        <Card>
          <CardHeader>
            <CardTitle>Cell Voltages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cellData?.cellVoltages?.map((v: number, i: number) => ({
                  cell: `Cell ${i + 1}`,
                  voltage: v,
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cell" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="voltage" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Charge/Discharge History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Charge/Discharge History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData?.chargeHistory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="charge"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="discharge"
                    stackId="1"
                    stroke="hsl(var(--destructive))"
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}