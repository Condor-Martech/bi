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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Filter } from "@/lib/api/endpoints/filters";
import { useCreateFilter, useDatasetTables, useDatasets, useUpdateFilter } from "@/lib/hooks/filters";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Current user id — needed because legacy CreateFilterDto requires `userId`. */
  userId: string;
  filter?: Filter;
}

export function FilterFormDialog({ open, onOpenChange, userId, filter }: Props) {
  const isEdit = Boolean(filter);

  const [table, setTable] = useState("");
  const [column, setColumn] = useState("");
  const [value, setValue] = useState("");
  const [datasetId, setDatasetId] = useState<string>("");

  const create = useCreateFilter();
  const update = useUpdateFilter();
  const datasets = useDatasets();
  const tables = useDatasetTables(datasetId || undefined);
  const isPending = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setTable(filter?.table ?? "");
      setColumn(filter?.column ?? "");
      setValue(filter?.value ?? "");
      setDatasetId("");
    }
  }, [open, filter]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit && filter?._id) {
      update.mutate(
        { id: filter._id, body: { table, column, value } },
        {
          onSuccess: () => {
            toast.success("Filtro actualizado.");
            onOpenChange(false);
          },
          onError: (err) => toast.error((err as Error).message ?? "Error al actualizar."),
        },
      );
      return;
    }
    create.mutate(
      { table, column, value, userId },
      {
        onSuccess: () => {
          toast.success("Filtro creado.");
          onOpenChange(false);
        },
        onError: (err) => toast.error((err as Error).message ?? "Error al crear."),
      },
    );
  }

  const selectedDataset = datasets.data?.find((d) => d.id === datasetId);
  const tableOptions = tables.data ?? [];
  const columnOptions =
    tableOptions.find((t) => t.name === table)?.columns?.map((c) => c.name).filter(Boolean) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar filtro" : "Crear filtro row-level"}</DialogTitle>
          <DialogDescription>
            Filtra una columna de una tabla Power BI por un valor. Aplica a los reportes del
            usuario asociado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="dataset">Dataset (ayuda — opcional)</Label>
              <Select value={datasetId} onValueChange={setDatasetId}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Elegí un dataset para ver sus tablas" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.data?.map((d) => (
                    <SelectItem key={d.id ?? d.name} value={d.id ?? ""}>
                      {d.name ?? d.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDataset && (
                <p className="text-xs text-muted-foreground">
                  {tableOptions.length} tablas disponibles.
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="table">Tabla</Label>
            {tableOptions.length > 0 ? (
              <Select value={table} onValueChange={setTable}>
                <SelectTrigger id="table">
                  <SelectValue placeholder="Elegí una tabla" />
                </SelectTrigger>
                <SelectContent>
                  {tableOptions.map((t) => (
                    <SelectItem key={t.name} value={t.name ?? ""}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="table"
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="DimCliente"
                required
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="column">Columna</Label>
            {columnOptions.length > 0 ? (
              <Select value={column} onValueChange={setColumn}>
                <SelectTrigger id="column">
                  <SelectValue placeholder="Elegí una columna" />
                </SelectTrigger>
                <SelectContent>
                  {columnOptions.map((c) => (
                    <SelectItem key={c} value={c!}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="column"
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                placeholder="Estado"
                required
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="SP"
              required
            />
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
