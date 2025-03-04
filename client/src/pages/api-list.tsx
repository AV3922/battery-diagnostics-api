import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ApiCard from "@/components/api-card";

const BATTERY_TYPES = ["All", "Li-ion", "LiFePO₄", "Lead-acid"];

const API_LIST = [
  // Electrical Parameters
  {
    id: "voltage",
    name: "Voltage Analysis",
    description: "Monitor battery voltage levels, including nominal, cutoff, and cell voltages",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "electrical",
    requestExample: {
      "batteryType": "Li-ion_24V",
      "voltage": 25.2,
      "temperature": 25
    },
    responseExample: {
      "stateOfCharge": 85.5,
      "estimatedRange": "68 km",
      "chargingStatus": "Charging",
      "temperatureCompensation": 1.0
    }
  },
  {
    id: "soc",
    name: "State of Charge",
    description: "Calculate real-time battery charge levels using voltage-based SOC estimation",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "electrical",
    requestExample: {
      "batteryType": "LiFePO4_48V",
      "voltage": 51.2,
      "temperature": 30
    },
    responseExample: {
      "stateOfCharge": 75.2,
      "estimatedRange": "60 km",
      "chargingStatus": "Discharging",
      "temperatureCompensation": 0.95
    }
  },
  {
    id: "soh",
    name: "State of Health",
    description: "Determine battery health status by comparing current vs rated capacity",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "electrical",
    requestExample: {
      "currentCapacity": 45.5,
      "ratedCapacity": 50.0,
      "cycleCount": 250
    },
    responseExample: {
      "stateOfHealth": 91.0,
      "capacityLoss": 9.0,
      "healthStatus": "Good",
      "recommendedAction": "Regular maintenance sufficient",
      "cycleAging": 25.0
    }
  },
  {
    id: "resistance",
    name: "Internal Resistance",
    description: "Measure battery internal resistance for performance analysis",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "electrical",
    requestExample: {
      "batteryType": "Li-ion_48V",
      "voltage": 49.5,
      "current": 10.0,
      "temperature": 28
    },
    responseExample: {
      "internalResistance": 125.5,
      "resistanceStatus": "Good",
      "powerLoss": "Normal"
    }
  },
  // Health Diagnosis
  {
    id: "capacity-fade",
    name: "Capacity Fade Analysis",
    description: "Track capacity degradation over time and usage cycles",
    batteryTypes: ["Li-ion", "LiFePO₄"],
    category: "health",
    requestExample: {
      "initialCapacity": 50.0,
      "currentCapacity": 46.5,
      "cycleCount": 300,
      "timeInService": 180
    },
    responseExample: {
      "capacityFade": 7.0,
      "fadeRate": 0.023,
      "projectedLifetime": "565 days",
      "recommendedAction": "Continue normal usage"
    }
  },
  {
    id: "cell-balance",
    name: "Cell Imbalance Detection",
    description: "Monitor individual cell voltages and detect dangerous imbalances",
    batteryTypes: ["Li-ion", "LiFePO₄"],
    category: "health",
    requestExample: {
      "cellVoltages": [3.65, 3.67, 3.62, 3.66, 3.64],
      "temperature": 25
    },
    responseExample: {
      "maxImbalance": 0.05,
      "balanceStatus": "Well Balanced",
      "problematicCells": null
    }
  },
  {
    id: "cycle-life",
    name: "Cycle Life Estimation",
    description: "Predict remaining battery life based on degradation patterns",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "health",
    requestExample: {
      "cycleCount": 450,
      "depthOfDischarge": 65.0,
      "avgTemperature": 28.5,
      "currentSoh": 88.5
    },
    responseExample: {
      "remainingCycles": 1550,
      "estimatedEOL": "2026-03-15",
      "confidenceLevel": 85.5
    }
  },
  // Safety Diagnosis
  {
    id: "safety-monitor",
    name: "Safety Monitoring",
    description: "Real-time monitoring of voltage, temperature, and current for safety risks",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "safety",
    requestExample: {
      "voltage": 48.5,
      "current": 15.2,
      "temperature": 42.0,
      "pressure": 1.1,
      "batteryType": "Li-ion_48V"
    },
    responseExample: {
      "safetyStatus": "Warning",
      "riskLevel": "Medium",
      "warningFlags": ["High current flow"],
      "recommendedActions": ["Monitor closely"]
    }
  },
  {
    id: "thermal-analysis",
    name: "Thermal Analysis",
    description: "Temperature monitoring and thermal runaway risk detection",
    batteryTypes: ["Li-ion", "LiFePO₄"],
    category: "safety",
    requestExample: {
      "temperature": 38.5,
      "rateOfChange": 1.5,
      "ambientTemp": 25.0,
      "loadProfile": "high"
    },
    responseExample: {
      "thermalStatus": "Warning",
      "runawayRisk": 35.0,
      "coolingNeeded": "Increase cooling",
      "temperatureMargin": 21.5
    }
  },
  // Fault Diagnosis
  {
    id: "fault-detection",
    name: "Fault Detection",
    description: "Detect and diagnose battery faults including internal damage and reverse current",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "fault",
    requestExample: {
      "voltage": 47.8,
      "current": -0.05,
      "temperature": 35.0,
      "impedance": 180.0,
      "batteryType": "Li-ion_48V"
    },
    responseExample: {
      "faultStatus": "Fault detected",
      "faultType": ["High internal impedance - possible damage"],
      "severity": "High",
      "recommendedActions": ["Reduce load", "Schedule maintenance"]
    }
  }
];

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "electrical", label: "Electrical Parameters" },
  { id: "health", label: "Health Diagnosis" },
  { id: "safety", label: "Safety Diagnosis" },
  { id: "fault", label: "Fault Diagnosis" },
];

export default function ApiList() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredApis = API_LIST.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(search.toLowerCase()) ||
                         api.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "All" || api.batteryTypes.includes(selectedType);
    const matchesCategory = selectedCategory === "all" || api.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Battery Diagnostics APIs</h1>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <aside className="space-y-6">
          <div>
            <Label htmlFor="search" className="text-blue-700">Search</Label>
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search APIs..."
              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label className="text-blue-700 font-medium">Battery Type</Label>
            <RadioGroup value={selectedType} onValueChange={setSelectedType}>
              {BATTERY_TYPES.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type}>{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-blue-700 font-medium">Category</Label>
            <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
              {CATEGORIES.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={category.id} id={category.id} />
                  <Label htmlFor={category.id}>{category.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </aside>

        <main>
          <div className="grid md:grid-cols-2 gap-6">
            {filteredApis.map(api => (
              <ApiCard key={api.id} {...api} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}