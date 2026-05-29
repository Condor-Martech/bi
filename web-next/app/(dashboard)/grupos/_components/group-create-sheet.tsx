"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAccounts } from "@/lib/hooks/accounts";
import { useCreateUserGroup } from "@/lib/hooks/user-groups";
import { useUsers } from "@/lib/hooks/users";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function GroupCreateSheet({ open, onOpenChange }: Props) {
  const router = useRouter();
  const { data: accounts = [] } = useAccounts();
  const { data: users = [] } = useUsers();
  const create = useCreateUserGroup();

  const [name, setName] = useState("");
  const [accountID, setAccountID] = useState("");
  const [firstUser, setFirstUser] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setAccountID("");
      setFirstUser("");
    }
  }, [open]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("O nome é obrigatório.");
    if (!accountID) return toast.error("Selecione uma conta BI.");
    if (!firstUser) return toast.error("Selecione um usuário inicial.");

    create.mutate(
      { name: name.trim(), accountID, users: firstUser, reports: [] },
      {
        onSuccess: (res) => {
          toast.success("Grupo criado. Atribua membros e relatórios.");
          onOpenChange(false);
          const id = (res as { _id?: string })?._id;
          if (id) router.push(`/grupos/${id}`);
        },
        onError: (err) => toast.error((err as Error).message ?? "Erro ao criar."),
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Criar grupo</SheetTitle>
          <SheetDescription>
            Apenas o básico: nome, conta BI e um primeiro membro. Depois você abre o grupo e
            atribui todos os relatórios e usuários que quiser.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marketing Brasil"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account">Conta BI</Label>
            <Select value={accountID} onValueChange={setAccountID}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.nameAccount} · {a.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              O tenant do Power BI de onde vêm os relatórios.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="first-user">Primeiro membro</Label>
            <Select value={firstUser} onValueChange={setFirstUser}>
              <SelectTrigger id="first-user">
                <SelectValue placeholder="Selecione o primeiro membro" />
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
            <p className="text-xs text-muted-foreground">
              Exigido pelo backend legacy. Você poderá adicionar mais na próxima tela.
            </p>
          </div>
        </form>

        <SheetFooter className="border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={create.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" onClick={onSubmit} disabled={create.isPending}>
            {create.isPending ? "Criando…" : "Criar e configurar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
