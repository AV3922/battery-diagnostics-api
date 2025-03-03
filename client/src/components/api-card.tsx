import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ApiCardProps {
  id: string;
  name: string;
  description: string;
  batteryTypes: string[];
  requestExample: Record<string, any>;
  responseExample: Record<string, any>;
}

export default function ApiCard({ id, name, description, batteryTypes, requestExample, responseExample }: ApiCardProps) {
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

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Request Example:</h4>
            <pre className="bg-secondary p-2 rounded-md overflow-x-auto">
              <code>{JSON.stringify(requestExample, null, 2)}</code>
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Response Example:</h4>
            <pre className="bg-secondary p-2 rounded-md overflow-x-auto">
              <code>{JSON.stringify(responseExample, null, 2)}</code>
            </pre>
          </div>
        </div>

        <Link href={`/api-detail/${id}`} className="block mt-4">
          <Button className="w-full">View Documentation</Button>
        </Link>
      </CardContent>
    </Card>
  );
}