"use client";

import { useCallback, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Account } from "@/lib/api/endpoints/accounts";
import { reportsKeys } from "@/lib/api/endpoints/reports";
import { useAccounts, useDeleteAccount } from "@/lib/hooks/accounts";
import { useSyncAccountReports, useSyncAllReports } from "@/lib/hooks/reports";
import { useSyncEvents } from "@/lib/hooks/sync-events";

import { DeleteConfirm } from "../users/_components/delete-confirm";

import { AccountFormDialog } from "./_components/account-form-dialog";
import { BackupRestore } from "./_components/backup-restore";

const toastIdForJob = (jobId: string) => `sync:${jobId}`;

export default function AccountsPage() {
  const qc = useQueryClient();
  const { data: accounts = [], isPending, error } = useAccounts();
  const del = useDeleteAccount();
  const syncAll = useSyncAllReports();
  const syncOne = useSyncAccountReports();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Account | undefined>(undefined);
  /** Jobs en vuelo: jobId → accountID. Drivea el spinner inline por fila. */
  const [activeSyncs, setActiveSyncs] = useState<Record<string, string>>({});
  /** Lookup accountID → nombre, para que los handlers de SSE no dependan del state. */
  const accountNameByIdRef = useRef<Record<string, string>>({});
  accountNameByIdRef.current = Object.fromEntries(accounts.map((a) => [a._id, a.nameAccount]));

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(a: Account) {
    setEditing(a);
    setFormOpen(true);
  }
  function confirmDelete(a: Account) {
    del.mutate(a._id, {
      onSuccess: () => {
        toast.success("Conta excluída.");
        setDeleteTarget(undefined);
      },
      onError: (err) => toast.error((err as Error).message ?? "Não foi possível excluir."),
    });
  }

  /**
   * Handler de eventos SSE de sync. Actualiza el toast por jobId y, cuando
   * termina (completed/failed), limpia el spinner inline e invalida la cache
   * de reports. Se mantiene estable con `useCallback` para que el efecto del
   * bus no se re-suscriba en cada render.
   */
  useSyncEvents(
    useCallback(
      (e) => {
        const accountName = accountNameByIdRef.current[e.data.accountID] ?? "conta";
        const id = toastIdForJob(e.data.jobId);

        if (e.type === "sync.started") {
          toast.loading(`Sincronizando ${accountName}…`, { id });
        } else if (e.type === "sync.progress") {
          toast.loading(e.data.message ?? `Sincronizando ${accountName}…`, { id });
        } else if (e.type === "sync.completed") {
          toast.success(
            `${accountName} sincronizada (${e.data.workspacesCount ?? 0} workspaces, ${e.data.reportsCount ?? 0} relatórios).`,
            { id },
          );
          setActiveSyncs((prev) => {
            const next = { ...prev };
            delete next[e.data.jobId];
            return next;
          });
          qc.invalidateQueries({ queryKey: reportsKeys.all });
        } else if (e.type === "sync.failed") {
          toast.error(`Não foi possível sincronizar ${accountName}: ${e.data.error}`, { id });
          setActiveSyncs((prev) => {
            const next = { ...prev };
            delete next[e.data.jobId];
            return next;
          });
        }
      },
      [qc],
    ),
  );

  function handleSyncAll() {
    syncAll.mutate(undefined, {
      onSuccess: ({ jobs }) => {
        if (jobs.length === 0) {
          toast.message("Não há contas para sincronizar.");
          return;
        }
        setActiveSyncs((prev) => {
          const next = { ...prev };
          for (const j of jobs) next[j.jobId] = j.accountID;
          return next;
        });
        for (const j of jobs) {
          const name = accountNameByIdRef.current[j.accountID] ?? "conta";
          toast.loading(
            j.dedup ? `Sincronização já em andamento para ${name}…` : `Sincronizando ${name}…`,
            { id: toastIdForJob(j.jobId) },
          );
        }
      },
      onError: (err) => toast.error((err as Error).message ?? "Não foi possível enfileirar a sincronização."),
    });
  }

  function handleSyncOne(a: Account) {
    syncOne.mutate(a._id, {
      onSuccess: ({ jobs }) => {
        const j = jobs[0];
        if (!j) return;
        setActiveSyncs((prev) => ({ ...prev, [j.jobId]: j.accountID }));
        toast.loading(
          j.dedup ? `Sincronização já em andamento para ${a.nameAccount}…` : `Sincronizando ${a.nameAccount}…`,
          { id: toastIdForJob(j.jobId) },
        );
      },
      onError: (err) =>
        toast.error((err as Error).message ?? "Não foi possível enfileirar a sincronização."),
    });
  }

  /** Hay algún sync en vuelo para esta accountID. */
  const isSyncingAccount = (accountId: string) =>
    Object.values(activeSyncs).includes(accountId);
  const isAnySyncRunning = Object.keys(activeSyncs).length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas Power BI</h1>
          <p className="text-sm text-muted-foreground">
            Credenciais Azure AD por tenant. Apenas MANAGER.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSyncAll}
            disabled={syncAll.isPending || isAnySyncRunning}
            className="gap-1.5"
          >
            <RefreshCw
              className={`size-3.5 ${syncAll.isPending || isAnySyncRunning ? "animate-spin" : ""}`}
            />
            Sincronizar todas
          </Button>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="size-3.5" />
            Criar conta
          </Button>
        </div>
      </header>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail Azure</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <>
                {[...Array(2)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {!isPending && error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-destructive">
                  Error: {(error as Error).message}
                </TableCell>
              </TableRow>
            )}
            {!isPending && !error && accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Ainda não há contas BI carregadas.
                </TableCell>
              </TableRow>
            )}
            {accounts.map((a) => (
              <TableRow key={a._id}>
                <TableCell className="font-medium">{a.nameAccount}</TableCell>
                <TableCell className="text-muted-foreground">{a.email}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {a.tenantId ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{a.userCount ?? a.users?.length ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleSyncOne(a)}
                        disabled={isSyncingAccount(a._id)}
                      >
                        <RefreshCw
                          className={`size-3.5 ${isSyncingAccount(a._id) ? "animate-spin" : ""}`}
                        />
                        Sincronizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(a)}>
                        <Pencil className="size-3.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="size-3.5" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BackupRestore />

      <AccountFormDialog open={formOpen} onOpenChange={setFormOpen} account={editing} />
      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(undefined);
        }}
        title="Excluir esta conta BI?"
        description={`${deleteTarget?.nameAccount ?? "A conta"} será excluída. Os relatórios e grupos vinculados ficarão órfãos.`}
        onConfirm={() => deleteTarget && confirmDelete(deleteTarget)}
        isPending={del.isPending}
      />
    </div>
  );
}
