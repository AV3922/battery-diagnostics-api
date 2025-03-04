import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Battery, Shield } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <Battery className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Battery OS
            </span>
          </a>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/api-list">
            <a className="text-muted-foreground hover:text-foreground transition">
              APIs
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="text-muted-foreground hover:text-foreground transition">
              Dashboard
            </a>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-border/40">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200">
              <Shield className="h-4 w-4 mr-2" />
              Get API Key
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}