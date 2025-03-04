import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import HeroSection from "@/components/hero-section";
import FeaturesGrid from "@/components/features-grid";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-matte-black">
      <HeroSection />
      
      <main className="container mx-auto px-4 py-12">
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
