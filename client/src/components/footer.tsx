import { Battery } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Battery className="h-6 w-6 text-primary" />
            <span className="font-semibold">Battery OS</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/privacy-policy" className="hover:text-foreground">Privacy Policy</a>
            <a href="/terms-of-use" className="hover:text-foreground">Terms of Use</a>
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          © 2024 Battery OS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}