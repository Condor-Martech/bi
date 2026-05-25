import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileQuestion className="size-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Página no encontrada</h1>
          <p className="text-sm text-muted-foreground">
            La ruta no existe o se movió. Volvé al inicio.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/">
            <Home className="size-3.5" />
            Inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
