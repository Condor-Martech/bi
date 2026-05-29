"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccounts } from "@/lib/hooks/accounts";
import { useDeleteUserGroup, useUserGroup } from "@/lib/hooks/user-groups";

import { DeleteConfirm } from "../../../users/_components/delete-confirm";
import { MembersSection } from "./members-section";
import { ReportsSection } from "./reports-section";
import { useState } from "react";

interface Props {
  id: string;
}

export function GroupDetailClient({ id }: Props) {
  const router = useRouter();
  const { data: group, isPending, error } = useUserGroup(id);
  const { data: accounts = [] } = useAccounts();
  const del = useDeleteUserGroup();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Link
          href="/grupos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Volver
        </Link>
        <p className="mt-4 text-sm text-destructive">
          Error al cargar el grupo: {(error as Error | undefined)?.message ?? "no encontrado"}
        </p>
      </div>
    );
  }

  const account = accounts.find((a) => a._id === group.accountID);
  const memberCount = group.users?.length ?? 0;
  const reportCount = group.reports?.length ?? 0;

  function onDelete() {
    del.mutate(id, {
      onSuccess: () => {
        toast.success("Grupo eliminado.");
        router.push("/grupos");
      },
      onError: (err) => toast.error((err as Error).message ?? "Error al eliminar."),
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <Link
          href="/grupos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Grupos
        </Link>
      </div>

      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
          <p className="text-sm text-muted-foreground">
            Cuenta BI:{" "}
            <span className="font-medium text-foreground">
              {account ? `${account.nameAccount} · ${account.email}` : group.accountID}
            </span>
          </p>
          <div className="flex gap-2 pt-1">
            <Badge variant="secondary" className="gap-1">
              <Users className="size-3" />
              {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <FileText className="size-3" />
              {reportCount} {reportCount === 1 ? "reporte" : "reportes"}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-3.5" />
          Eliminar grupo
        </Button>
      </header>

      <Tabs defaultValue="members" className="gap-4">
        <TabsList>
          <TabsTrigger value="members" className="gap-1.5">
            <Users className="size-3.5" />
            Miembros
            <Badge variant="outline" className="ml-1">
              {memberCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <FileText className="size-3.5" />
            Reportes
            <Badge variant="outline" className="ml-1">
              {reportCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersSection group={group} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsSection group={group} />
        </TabsContent>
      </Tabs>

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar este grupo?"
        description={`Se elimina ${group.name} y se desvinculan sus miembros.`}
        onConfirm={onDelete}
        isPending={del.isPending}
      />
    </div>
  );
}
