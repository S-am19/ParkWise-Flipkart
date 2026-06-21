import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Hotspot } from "@/types";

export function RecommendationsPanel({ hotspot }: { hotspot?: Hotspot | null }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Recommendation</CardTitle>
          <Badge tone="info">
            <Sparkles size={13} className="mr-1" />
            Placeholder
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-300">
          {hotspot
            ? `${hotspot.location} shows elevated parking violations during the ${String(
                hotspot.peak_hour,
              ).padStart(2, "0")}:00 peak window. Targeted enforcement during the identified peak period is recommended.`
            : "This hotspot shows elevated parking violations during peak hours. Targeted enforcement during the identified peak period is recommended."}
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Future integration point: send selected hotspot context to a Groq-backed recommendation service.
        </p>
      </CardContent>
    </Card>
  );
}
