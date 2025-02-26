import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background border-b">
      <div className="container mx-auto px-4 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Battery Diagnostics APIs
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive battery health monitoring and diagnostics APIs for Li-ion, LiFePO₄, and Lead-acid batteries. Get real-time insights into battery performance and predict potential failures.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/api-list">
              <Button size="lg">Get Started</Button>
            </Link>
            <Button variant="outline" size="lg">View Documentation</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
