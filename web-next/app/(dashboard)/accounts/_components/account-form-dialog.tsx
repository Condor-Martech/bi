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
import type { Account, CreateAccountBody } from "@/lib/api/endpoints/accounts";
import { useCreateAccount, useUpdateAccount } from "@/lib/hooks/accounts";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  account?: Account;
}

const EMPTY: CreateAccountBody = {
  nameAccount: "",
  email: "",
  pass: "",
  clientId: "",
  clientSecret: "",
  tenantId: "",
};

export function AccountFormDialog({ open, onOpenChange, account }: Props) {
  const isEdit = Boolean(account);
  const create = useCreateAccount();
  const update = useUpdateAccount();
  const isPending = create.isPending || update.isPending;

  const [form, setForm] = useState<CreateAccountBody>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY,
        nameAccount: account?.nameAccount ?? "",
        email: account?.email ?? "",
        clientId: account?.clientId ?? "",
        tenantId: account?.tenantId ?? "",
      });
    }
  }, [open, account]);

  function field<K extends keyof CreateAccountBody>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit && account?._id) {
      // On edit, send only non-empty secret fields
      const body = {
        nameAccount: form.nameAccount,
        email: form.email,
        clientId: form.clientId,
        tenantId: form.tenantId,
        ...(form.pass ? { pass: form.pass } : {}),
        ...(form.clientSecret ? { clientSecret: form.clientSecret } : {}),
      };
      update.mutate(
        { id: account._id, body },
        {
          onSuccess: () => {
            toast.success("Conta atualizada.");
            onOpenChange(false);
          },
          onError: (err) => toast.error((err as Error).message ?? "Erro ao atualizar."),
        },
      );
      return;
    }
    create.mutate(form, {
      onSuccess: () => {
        toast.success("Conta criada e vinculada ao seu usuário.");
        onOpenChange(false);
      },
      onError: (err) => toast.error((err as Error).message ?? "Erro ao criar."),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar conta BI" : "Criar conta BI"}</DialogTitle>
          <DialogDescription>
            Credenciais Azure AD do tenant Power BI. A senha e o client secret são
            armazenados criptografados no servidor.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nameAccount">Nome interno</Label>
              <Input
                id="nameAccount"
                value={form.nameAccount}
                onChange={field("nameAccount")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail Azure AD</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={field("email")}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pass">
              Senha Azure AD {isEdit && <span className="text-muted-foreground">(opcional ao editar)</span>}
            </Label>
            <Input
              id="pass"
              type="password"
              value={form.pass}
              onChange={field("pass")}
              required={!isEdit}
              autoComplete="new-password"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={form.clientId}
                onChange={field("clientId")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input
                id="tenantId"
                value={form.tenantId}
                onChange={field("tenantId")}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientSecret">
              Client Secret {isEdit && <span className="text-muted-foreground">(opcional ao editar)</span>}
            </Label>
            <Input
              id="clientSecret"
              type="password"
              value={form.clientSecret}
              onChange={field("clientSecret")}
              required={!isEdit}
              autoComplete="new-password"
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
