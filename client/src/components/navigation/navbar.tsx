import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold">BatteryAPI</a>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/api-list">
            <a className="text-muted-foreground hover:text-foreground">APIs</a>
          </Link>
          <Button variant="outline">Sign In</Button>
          <Button>Get API Key</Button>
        </div>
      </div>
    </nav>
  );
}
