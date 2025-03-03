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
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {batteryTypes.map(type => (
            <Badge key={type} variant="secondary">{type}</Badge>
          ))}
        </div>

        <Link href={`/api-detail/${id}`} className="block mt-4">
          <Button className="w-full">View Documentation</Button>
        </Link>
      </CardContent>
    </Card>
  );
}