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
            toast.success("Filtro atualizado.");
            onOpenChange(false);
          },
          onError: (err) => toast.error((err as Error).message ?? "Erro ao atualizar."),
        },
      );
      return;
    }
    create.mutate(
      { table, column, value, userId },
      {
        onSuccess: () => {
          toast.success("Filtro criado.");
          onOpenChange(false);
        },
        onError: (err) => toast.error((err as Error).message ?? "Erro ao criar."),
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
          <DialogTitle>{isEdit ? "Editar filtro" : "Criar filtro row-level"}</DialogTitle>
          <DialogDescription>
            Filtra uma coluna de uma tabela do Power BI por um valor. Aplica aos relatórios do
            usuário associado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="dataset">Dataset (ajuda — opcional)</Label>
              <Select value={datasetId} onValueChange={setDatasetId}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Selecione um dataset para ver suas tabelas" />
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
                  {tableOptions.length} tabelas disponíveis.
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="table">Tabela</Label>
            {tableOptions.length > 0 ? (
              <Select value={table} onValueChange={setTable}>
                <SelectTrigger id="table">
                  <SelectValue placeholder="Selecione uma tabela" />
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
            <Label htmlFor="column">Coluna</Label>
            {columnOptions.length > 0 ? (
              <Select value={column} onValueChange={setColumn}>
                <SelectTrigger id="column">
                  <SelectValue placeholder="Selecione uma coluna" />
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
              {isPending ? "Salvando…" : isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
