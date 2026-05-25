import Link from "next/link";
import { FileBarChart2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FavoriteCardProps {
  reportIdPB: string;
  name?: string;
  accountLabel?: string | null;
}

export function FavoriteCard({ reportIdPB, name, accountLabel }: FavoriteCardProps) {
  return (
    <Link href={`/report/${reportIdPB}`} className="block">
      <Card className="group transition-colors hover:bg-accent">
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <FileBarChart2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="line-clamp-2 text-sm font-medium">
              {name ?? "Reporte sin nombre"}
            </CardTitle>
          </div>
          <Star
            className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400"
            aria-label="Favorito"
          />
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 font-mono text-xs text-muted-foreground">
            {reportIdPB || "—"}
          </p>
          {accountLabel && (
            <Badge variant="secondary" className="text-[10px]">
              {accountLabel}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
