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
import { Textarea } from "@/components/ui/textarea";
import type { UserGroup } from "@/lib/api/endpoints/user-groups";
import { useAccounts } from "@/lib/hooks/accounts";
import {
  useCreateUserGroup,
  useUpdateUserGroup,
} from "@/lib/hooks/user-groups";
import { useUsers } from "@/lib/hooks/users";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group?: UserGroup;
}

export function GroupFormDialog({ open, onOpenChange, group }: Props) {
  const isEdit = Boolean(group);

  const { data: accounts = [] } = useAccounts();
  const { data: users = [] } = useUsers();
  const create = useCreateUserGroup();
  const update = useUpdateUserGroup();
  const isPending = create.isPending || update.isPending;

  const [name, setName] = useState("");
  const [accountID, setAccountID] = useState("");
  const [firstUser, setFirstUser] = useState("");
  const [reportsRaw, setReportsRaw] = useState("");

  useEffect(() => {
    if (open) {
      setName(group?.name ?? "");
      setAccountID(group?.accountID ?? "");
      setFirstUser("");
      setReportsRaw((group?.reports ?? []).join("\n"));
    }
  }, [open, group]);

  function parseReports(): string[] {
    return reportsRaw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const reports = parseReports();

    if (isEdit && group?._id) {
      update.mutate(
        { id: group._id, body: { name, accountID, reports } },
        {
          onSuccess: () => {
            toast.success("Grupo actualizado.");
            onOpenChange(false);
          },
          onError: (err) => toast.error((err as Error).message ?? "Error al actualizar."),
        },
      );
      return;
    }

    if (!firstUser) {
      toast.error("Tenés que elegir un usuario inicial.");
      return;
    }

    create.mutate(
      { name, accountID, users: firstUser, reports },
      {
        onSuccess: () => {
          toast.success("Grupo creado.");
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
          <DialogTitle>{isEdit ? "Editar grupo" : "Crear grupo"}</DialogTitle>
          <DialogDescription>
            Los grupos agrupan usuarios y les asignan reportes. La pertenencia se resuelve en
            vivo desde acá.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account">Cuenta BI</Label>
            <Select value={accountID} onValueChange={setAccountID}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Elegí una cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.nameAccount} · {a.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="first-user">Usuario inicial</Label>
              <Select value={firstUser} onValueChange={setFirstUser}>
                <SelectTrigger id="first-user">
                  <SelectValue placeholder="Elegí el primer miembro" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => {
                    const id = u._id ?? u.id ?? u.email ?? "";
                    if (!id) return null;
                    return (
                      <SelectItem key={id} value={id}>
                        {u.name} · {u.email}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reports">Reportes (uno por línea o separados por coma)</Label>
            <Textarea
              id="reports"
              value={reportsRaw}
              onChange={(e) => setReportsRaw(e.target.value)}
              placeholder="6e277bac-97e4-43cc-ad65-b96dbdd65f57"
              className="min-h-24 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">UUIDs de Power BI (reportIdPB).</p>
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
