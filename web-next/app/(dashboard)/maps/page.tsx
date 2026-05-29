"use client";

import Image from "next/image";
import { MapPinned } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaps } from "@/lib/hooks/maps";

import { UploadMapDialog } from "./_components/upload-map-dialog";

export default function MapsPage() {
  const { data: maps = [], isPending, error } = useMaps();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mapas</h1>
          <p className="text-sm text-muted-foreground">
            Arquivos de imagem hospedados no servidor. Disponíveis via webUrl pública.
          </p>
        </div>
        <UploadMapDialog />
      </header>

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            Erro ao carregar mapas: {(error as Error).message}
          </CardContent>
        </Card>
      )}

      {isPending && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      )}

      {!isPending && !error && maps.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <MapPinned className="size-6" />
            Nenhum mapa enviado ainda.
          </CardContent>
        </Card>
      )}

      {!isPending && maps.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {maps.map((m) => (
            <Card key={m._id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {m.webUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.webUrl}
                    alt={m.name ?? "Mapa"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <MapPinned className="size-6" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="line-clamp-1 text-sm font-medium">{m.name ?? "Sem nome"}</p>
                {m.webUrl && (
                  <a
                    href={m.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-1 font-mono text-[10px] text-muted-foreground hover:underline"
                  >
                    {m.webUrl}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
