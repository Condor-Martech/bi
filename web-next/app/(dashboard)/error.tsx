"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary scoped to the (dashboard) route group. Keeps the sidebar
 * visible while the failing page swaps for this fallback.
 */
export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex min-h-full items-center justify-center p-12">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">No se pudo cargar la página</p>
          <p className="text-xs text-muted-foreground">
            {error.message || "Error interno. Probá de nuevo."}
          </p>
          {error.digest && (
            <p className="pt-1 font-mono text-[10px] text-muted-foreground">
              digest: {error.digest}
            </p>
          )}
        </div>
        <Button size="sm" onClick={reset} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}
