"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomReport } from "@/lib/api/endpoints/custom-reports";
import {
  useCreateCustomReport,
  useUpdateCustomReport,
} from "@/lib/hooks/custom-reports";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Author id is required by the legacy DTO — passed in from the page (current user). */
  authorId: string;
  customReport?: CustomReport;
}

export function CustomReportFormDialog({ open, onOpenChange, authorId, customReport }: Props) {
  const isEdit = Boolean(customReport);
  const create = useCreateCustomReport();
  const update = useUpdateCustomReport();
  const isPending = create.isPending || update.isPending;

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (open) {
      setName(customReport?.name ?? "");
      setUrl(customReport?.url ?? "");
    }
  }, [open, customReport]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEdit && customReport?.reportIdPB) {
      update.mutate(
        { reportIdPB: customReport.reportIdPB, body: { name, url } },
        {
          onSuccess: () => {
            toast.success("Reporte custom actualizado.");
            onOpenChange(false);
          },
          onError: (err) => toast.error((err as Error).message ?? "Error al actualizar."),
        },
      );
      return;
    }

    create.mutate(
      { name, url, author: authorId },
      {
        onSuccess: () => {
          toast.success("Reporte custom creado.");
          onOpenChange(false);
        },
        onError: (err) => toast.error((err as Error).message ?? "Error al crear."),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar reporte custom" : "Crear reporte custom"}</DialogTitle>
          <DialogDescription>
            Reportes externos servidos por URL (no son Power BI nativos — pueden ser otra
            herramienta de BI o un dashboard público).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://app.powerbi.com/view?r=…"
              required
            />
            <p className="text-xs text-muted-foreground">
              Puede ser un embed de Power BI público, Looker Studio, Metabase, etc.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : isEdit ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
