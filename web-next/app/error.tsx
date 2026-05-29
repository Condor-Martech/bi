"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for unhandled exceptions outside the (dashboard) tree.
 * Next renders this when a Server Component or RSC fetch throws and no closer
 * `error.tsx` catches it.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Algo deu errado</h1>
          <p className="text-sm text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente. Se persistir, entre em contato
            com um administrador.
          </p>
          {error.digest && (
            <p className="pt-2 font-mono text-[10px] text-muted-foreground">
              digest: {error.digest}
            </p>
          )}
        </div>
        <Button onClick={reset} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
