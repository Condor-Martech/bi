"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadMap } from "@/lib/hooks/maps";

export function UploadMapDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadMap();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Seleccioná un archivo.");
      return;
    }
    upload.mutate(
      { file, name },
      {
        onSuccess: ({ linkMap }) => {
          toast.success(`Mapa "${linkMap.name ?? name}" subido.`);
          setOpen(false);
          setName("");
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (err) => toast.error((err as Error).message ?? "Error al subir."),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Upload className="size-3.5" />
          Subir mapa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir mapa</DialogTitle>
          <DialogDescription>
            Archivo de imagen + nombre de exhibición. Los tipos permitidos los define el
            backend (MULTER_TYPES).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="map-name">Nombre</Label>
            <Input
              id="map-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mapa de ventas por región"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="map-file">Archivo</Label>
            <Input
              id="map-file"
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} · {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={upload.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={upload.isPending || !file}>
              {upload.isPending ? "Subiendo…" : "Subir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
