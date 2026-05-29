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
    if (!name.trim()) return toast.error("El nombre es obligatorio.");
    if (!accountID) return toast.error("Elegí una cuenta BI.");
    if (!firstUser) return toast.error("Elegí un usuario inicial.");

    create.mutate(
      { name: name.trim(), accountID, users: firstUser, reports: [] },
      {
        onSuccess: (res) => {
          toast.success("Grupo creado. Asigná miembros y reportes.");
          onOpenChange(false);
          const id = (res as { _id?: string })?._id;
          if (id) router.push(`/grupos/${id}`);
        },
        onError: (err) => toast.error((err as Error).message ?? "Error al crear."),
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Crear grupo</SheetTitle>
          <SheetDescription>
            Sólo lo básico: nombre, cuenta BI y un primer miembro. Después abrís el grupo y
            asignás todos los reportes y usuarios que quieras.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 px-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Marketing Brasil"
              required
              autoFocus
            />
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
            <p className="text-xs text-muted-foreground">
              El tenant de Power BI del que se sirven los reportes.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="first-user">Primer miembro</Label>
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
            <p className="text-xs text-muted-foreground">
              Requerido por el backend legacy. Vas a poder agregar más en la próxima pantalla.
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
            {create.isPending ? "Creando…" : "Crear y configurar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
