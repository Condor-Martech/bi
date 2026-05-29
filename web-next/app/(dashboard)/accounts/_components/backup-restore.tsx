"use client";

import { useState } from "react";
import { Archive, DatabaseBackup, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useBackups, useCreateBackup, useRestoreBackup } from "@/lib/hooks/accounts";

export function BackupRestore() {
  const { data: backups = [], isPending } = useBackups();
  const create = useCreateBackup();
  const restore = useRestoreBackup();

  const [restoreOpen, setRestoreOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");

  function onBackup() {
    create.mutate(undefined, {
      onSuccess: ({ file }) => toast.success(`Backup criado: ${file}`),
      onError: (err) => toast.error((err as Error).message ?? "Erro ao criar backup."),
    });
  }

  function onRestore() {
    if (!selectedFile) return;
    restore.mutate(
      { fileName: selectedFile },
      {
        onSuccess: () => {
          toast.success(`Restauração aplicada a partir de ${selectedFile}.`);
          setRestoreOpen(false);
          setSelectedFile("");
        },
        onError: (err) => toast.error((err as Error).message ?? "Erro ao restaurar."),
      },
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DatabaseBackup className="size-4" />
          Backup e restauração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={onBackup} disabled={create.isPending} className="gap-1.5">
            {create.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Archive className="size-3.5" />
            )}
            {create.isPending ? "Gerando…" : "Criar backup agora"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setRestoreOpen(true)}
            disabled={isPending || backups.length === 0}
            className="gap-1.5"
          >
            <Upload className="size-3.5" />
            Restaurar
          </Button>
        </div>

        <div className="space-y-1 text-sm">
          <p className="text-xs font-medium text-muted-foreground">
            Backups disponíveis ({backups.length})
          </p>
          {isPending ? (
            <p className="text-xs text-muted-foreground">Carregando…</p>
          ) : backups.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Ainda não há backups. Crie um com o botão acima.
            </p>
          ) : (
            <ul className="space-y-0.5 font-mono text-xs">
              {backups.slice(0, 10).map((b, i) => (
                <li key={(b.fileName ?? b.name ?? i).toString()}>
                  {b.fileName ?? b.name ?? "—"}
                </li>
              ))}
              {backups.length > 10 && (
                <li className="text-muted-foreground">… mais {backups.length - 10}</li>
              )}
            </ul>
          )}
        </div>
      </CardContent>

      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restaurar backup</DialogTitle>
            <DialogDescription>
              ⚠️ Esta operação SUBSTITUI dados em produção. Confirme o arquivo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="file">Nome do arquivo</Label>
            <Input
              id="file"
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              placeholder="backup-2026-05-22-001.archive"
              list="backup-options"
              className="font-mono text-xs"
            />
            <datalist id="backup-options">
              {backups.map((b) => (
                <option key={b.fileName ?? b.name} value={b.fileName ?? b.name ?? ""} />
              ))}
            </datalist>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRestoreOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onRestore}
              disabled={!selectedFile || restore.isPending}
            >
              {restore.isPending ? "Restaurando…" : "Restaurar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
