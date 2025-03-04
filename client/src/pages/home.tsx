import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import HeroSection from "@/components/hero-section";
import FeaturesGrid from "@/components/features-grid";

import { useState, useEffect } from "react";
import { Battery } from "lucide-react";

export default function Home() {
  const [batteryLevel, setBatteryLevel] = useState(0);
  
  // Battery animation effect for home page
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => (prev >= 100 ? 0 : prev + 5));
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black to-gray-900">
      <HeroSection />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0">
        <div className="relative h-96 w-96">
          <Battery className="h-96 w-96 text-primary" strokeWidth={1} />
          <div 
            className="absolute bottom-[12px] left-[8px] right-[12px] bg-gradient-to-r from-blue-500 to-blue-700 rounded-sm"
            style={{ 
              height: `${Math.min(batteryLevel, 100) * 0.75}%`,
              transition: 'height 0.2s ease-in-out'
            }}
          ></div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <FeaturesGrid />
        
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <div className="flex gap-4 justify-center">
            <Link href="/api-list">
              <Button size="lg">
                Browse APIs
              </Button>
            </Link>
            <Button variant="outline" size="lg" asChild>
              <a href="https://docs.example.com" target="_blank" rel="noopener">
                Read Docs
              </a>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
