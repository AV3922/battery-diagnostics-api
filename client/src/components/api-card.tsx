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
    <Card className="border-t-4 border-t-gradient-blue-light">
      <CardHeader>
        <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {batteryTypes.map(type => (
            <Badge key={type} variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">{type}</Badge>
          ))}
        </div>

        <Link href={`/api-detail/${id}`} className="block mt-4">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200">View Documentation</Button>
        </Link>
      </CardContent>
    </Card>
  );
}