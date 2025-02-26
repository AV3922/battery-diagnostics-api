import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ApiCard from "@/components/api-card";

const BATTERY_TYPES = ["All", "Li-ion", "LiFePO₄", "Lead-acid"];

const API_LIST = [
  {
    id: "soh",
    name: "State of Health",
    description: "Calculate battery State of Health (SOH) to determine remaining useful life",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
  },
  {
    id: "soc",
    name: "State of Charge",
    description: "Monitor real-time State of Charge (SOC) for accurate battery level tracking",
    batteryTypes: ["Li-ion", "LiFePO₄", "Lead-acid"],
  },
  {
    id: "fault-detection",
    name: "Fault Detection",
    description: "AI-powered fault detection and predictive diagnostics",
    batteryTypes: ["Li-ion", "LiFePO₄"],
  },
  // Add more API endpoints
];

export default function ApiList() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const filteredApis = API_LIST.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(search.toLowerCase()) ||
                         api.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "All" || api.batteryTypes.includes(selectedType);
    return matchesSearch && matchesType;
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
