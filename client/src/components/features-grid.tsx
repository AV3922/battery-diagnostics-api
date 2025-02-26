import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Battery, Shield, Activity, Zap } from "lucide-react";

const features = [
  {
    title: "State of Health",
    description: "Monitor battery health and predict remaining useful life",
    icon: Battery,
  },
  {
    title: "Safety Monitoring",
    description: "Real-time safety checks and risk assessment",
    icon: Shield,
  },
  {
    title: "Performance Analytics",
    description: "Detailed performance metrics and trending",
    icon: Activity,
  },
  {
    title: "Fault Detection",
    description: "AI-powered fault detection and diagnostics",
    icon: Zap,
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-12">
        Comprehensive Battery Analytics
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
