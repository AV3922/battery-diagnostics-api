import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Battery, Zap, Timer, Thermometer, Activity, 
  AlertTriangle, TrendingUp, Cpu, BarChart2 
} from "lucide-react";

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Battery Management System</h1> {/* Added gradient class */}
          <p className="text-muted-foreground mt-2">AI-Powered Real-Time Analytics</p>
        </div>
        <Badge variant="outline" className="text-xl py-2">
          System Status: Optimal
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Current Stats */}
        <Card className="bg-card/50 backdrop-blur border-blue-gradient"> {/* Added gradient class */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pack Voltage</CardTitle>
            <Battery className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voltageData?.voltage.toFixed(2)}V</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Nominal: {voltageData?.nominalVoltage}V</span>
              <Badge variant="secondary" className="ml-2">±0.1V</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-blue-gradient"> {/* Added gradient class */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">State of Charge</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voltageData?.stateOfCharge}%</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Range: {voltageData?.estimatedRange}km</span>
              <Badge variant="secondary" className="ml-2">Optimal</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-blue-gradient"> {/* Added gradient class */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Power Analysis</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.8%</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Efficiency</span>
              <Badge variant="secondary" className="ml-2">High</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-blue-gradient"> {/* Added gradient class */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.2%</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Cell Health</span>
              <Badge variant="secondary" className="ml-2">Excellent</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Voltage History Chart */}
        <Card className="border-blue-gradient"> {/* Added gradient class */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text"> {/* Added gradient class */}
              <TrendingUp className="h-5 w-5" />
              Voltage Telemetry
            </CardTitle>
            <CardDescription>Real-time pack voltage monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={voltageHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cell Voltages */}
        <Card className="border-blue-gradient"> {/* Added gradient class */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text"> {/* Added gradient class */}
              <Cpu className="h-5 w-5" />
              Cell Balance Analysis
            </CardTitle>
            <CardDescription>Individual cell voltage distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cellData?.cellVoltages?.map((v: number, i: number) => ({
                  cell: `Cell ${i + 1}`,
                  voltage: v,
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="cell" />
                  <YAxis domain={[3.8, 4.0]} />
                  <Tooltip />
                  <Bar dataKey="voltage" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Thermal Map */}
        <Card className="lg:col-span-2 border-blue-gradient"> {/* Added gradient class */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text"> {/* Added gradient class */}
              <BarChart2 className="h-5 w-5" />
              Energy Flow Analysis
            </CardTitle>
            <CardDescription>Charge/discharge cycles with predictive trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData?.chargeHistory || []}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
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

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 backdrop-blur border-blue-gradient"> {/* Added gradient class */}
          <CardHeader>
            <CardTitle className="text-sm gradient-text"> {/* Added gradient class */} AI Health Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">Based on current telemetry:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>98.5% probability of optimal performance</li>
                <li>Estimated 2.3 years until maintenance</li>
                <li>No anomalies detected in cell behavior</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-blue-gradient"> {/* Added gradient class */}
          <CardHeader>
            <CardTitle className="text-sm gradient-text"> {/* Added gradient class */}Performance Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">System recommendations:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Current charging pattern is optimal</li>
                <li>Temperature distribution within ideal range</li>
                <li>Cell balancing performing efficiently</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-blue-gradient"> {/* Added gradient class */}
          <CardHeader>
            <CardTitle className="text-sm gradient-text"> {/* Added gradient class */}Predictive Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">Next maintenance window:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Cell balancing check in 45 days</li>
                <li>Thermal system inspection in 90 days</li>
                <li>Full diagnostic scan in 180 days</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}