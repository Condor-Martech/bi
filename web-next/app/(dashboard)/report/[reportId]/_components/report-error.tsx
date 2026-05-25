"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ReportErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ReportError({ message, onRetry }: ReportErrorProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-md border border-border bg-card p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {message ?? "No se pudo cargar el reporte."}
        </p>
        <p className="text-xs text-muted-foreground">
          Probá de nuevo. Si persiste, contactá a un administrador.
        </p>
      </div>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3.5" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
