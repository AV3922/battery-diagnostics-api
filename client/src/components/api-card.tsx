import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ApiCardProps {
  id: string;
  name: string;
  description: string;
  batteryTypes: string[];
}

export default function ApiCard({ id, name, description, batteryTypes }: ApiCardProps) {
  return (
    <Card className="bg-gradient-matte-dark border border-border/30 hover:border-border/60 transition-all">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {batteryTypes.map(type => (
            <Badge key={type} variant="secondary" className="text-sm py-1 px-2">{type}</Badge>
          ))}
        </div>

        <Link href={`/api-detail/${id}`} className="block mt-4">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200">View Documentation</Button>
        </Link>
      </CardContent>
    </Card>
  );
}