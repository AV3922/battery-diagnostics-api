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
            <Link href="/dashboard">
              <Button variant="outline" size="lg">View Live Dashboard</Button>
            </Link>
            {/* Added Get API Key button here */}
            <Link href="/get-api-key"> {/* Assuming a route for getting the API key */}
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200">
                <span className="h-4 w-4">{/* Placeholder for Key component */}</span>
                Get API Key
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}