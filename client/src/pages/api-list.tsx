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
  },
  {
    id: "soc",
    name: "State of Charge",
    description: "Calculate real-time battery charge levels using voltage-based SOC estimation",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "electrical",
  },
  {
    id: "soh",
    name: "State of Health",
    description: "Determine battery health status by comparing current vs rated capacity",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "electrical",
  },
  {
    id: "resistance",
    name: "Internal Resistance",
    description: "Measure battery internal resistance for performance analysis",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "electrical",
  },
  // Health Diagnosis
  {
    id: "capacity-fade",
    name: "Capacity Fade Analysis",
    description: "Track capacity degradation over time and usage cycles",
    batteryTypes: ["Li-ion", "LiFePO₄"],
    category: "health",
  },
  {
    id: "cell-balance",
    name: "Cell Imbalance Detection",
    description: "Monitor individual cell voltages and detect dangerous imbalances",
    batteryTypes: ["Li-ion", "LiFePO₄"],
    category: "health",
  },
  {
    id: "cycle-life",
    name: "Cycle Life Estimation",
    description: "Predict remaining battery life based on degradation patterns",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "health",
  },
  // Safety Diagnosis
  {
    id: "safety-monitor",
    name: "Safety Monitoring",
    description: "Real-time monitoring of voltage, temperature, and current for safety risks",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "safety",
  },
  {
    id: "thermal-analysis",
    name: "Thermal Analysis",
    description: "Temperature monitoring and thermal runaway risk detection",
    batteryTypes: ["Li-ion", "LiFePO₄"],
    category: "safety",
  },
  // Fault Diagnosis
  {
    id: "fault-detection",
    name: "Fault Detection",
    description: "Detect and diagnose battery faults including internal damage and reverse current",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
    category: "fault",
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
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search APIs..."
            />
          </div>

          <div>
            <Label>Battery Type</Label>
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
            <Label>Category</Label>
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