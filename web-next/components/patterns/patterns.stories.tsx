import type { Story } from "@ladle/react";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  KanbanSquare,
  Layers,
  ListFilter,
  Plus,
  TableProperties,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  DataTable,
  type DataTableDensity,
} from "@/components/patterns/data-table";
import {
  ViewBar,
  ViewBarAction,
  ViewBarDensity,
  ViewBarSearch,
  ViewBarSection,
  ViewBarSeparator,
  ViewBarSpacer,
  ViewBarViewSwitcher,
} from "@/components/patterns/view-bar";

interface Report {
  id: string;
  name: string;
  workspace: string;
  owner: string;
  status: "active" | "draft" | "archived" | "failed";
  views: number;
}

const DEMO_DATA: Report[] = [
  { id: "1", name: "Ventas Q1 2026", workspace: "Comercial", owner: "Mariana López", status: "active", views: 1247 },
  { id: "2", name: "Operaciones — turno noche", workspace: "Ops", owner: "Bruno Castro", status: "active", views: 432 },
  { id: "3", name: "Tablero ejecutivo", workspace: "C-Level", owner: "Lucía Vega", status: "draft", views: 12 },
  { id: "4", name: "Stock por almacén", workspace: "Logística", owner: "Pedro Núñez", status: "archived", views: 5 },
  { id: "5", name: "Cohortes de retención", workspace: "Producto", owner: "Renata Silva", status: "failed", views: 89 },
  { id: "6", name: "Funnel de conversión", workspace: "Marketing", owner: "Iván Pérez", status: "active", views: 768 },
  { id: "7", name: "Costos por proyecto", workspace: "Finanzas", owner: "Sofía Aguilar", status: "active", views: 312 },
  { id: "8", name: "NPS por segmento", workspace: "CX", owner: "Carla Mendes", status: "draft", views: 0 },
];

const STATUS_VARIANT = {
  active: "green",
  draft: "gray",
  archived: "orange",
  failed: "red",
} as const;

const STATUS_LABEL = {
  active: "Activo",
  draft: "Borrador",
  archived: "Archivado",
  failed: "Falló",
} as const;

const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "name",
    header: "Reporte",
    cell: ({ row }) => (
      <span className="text-foreground font-medium">{row.original.name}</span>
    ),
    size: 280,
  },
  {
    accessorKey: "workspace",
    header: "Workspace",
    size: 160,
  },
  {
    accessorKey: "owner",
    header: "Owner",
    size: 180,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <Chip variant={STATUS_VARIANT[row.original.status]}>
        {STATUS_LABEL[row.original.status]}
      </Chip>
    ),
    size: 120,
  },
  {
    accessorKey: "views",
    header: "Vistas",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.views.toLocaleString()}</span>
    ),
    size: 100,
  },
];

export const ReportsListing: Story = () => {
  const [search, setSearch] = useState("");
  const [density, setDensity] = useState<DataTableDensity>("cozy");
  const [view, setView] = useState<"table" | "board">("table");

  const filtered = useMemo(() => {
    if (!search) return DEMO_DATA;
    const q = search.toLowerCase();
    return DEMO_DATA.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.workspace.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="bg-background flex flex-col">
      <ViewBar>
        <ViewBarSection>
          <Layers className="text-muted-foreground size-3.5" />
          <span className="text-xs font-medium">Reportes</span>
        </ViewBarSection>

        <ViewBarSeparator />

        <ViewBarSearch
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar reportes…"
        />

        <ViewBarAction>
          <ListFilter className="size-3.5" />
          Filtros
        </ViewBarAction>

        <ViewBarSpacer />

        <ViewBarDensity value={density} onValueChange={setDensity} />

        <ViewBarSeparator />

        <ViewBarViewSwitcher
          value={view}
          onValueChange={setView}
          options={[
            {
              value: "table",
              label: "Tabla",
              icon: <TableProperties className="size-3" />,
            },
            {
              value: "board",
              label: "Board",
              icon: <KanbanSquare className="size-3" />,
            },
          ]}
        />

        <ViewBarSeparator />

        <Button size="sm" className="h-7 gap-1 text-xs">
          <Plus className="size-3" />
          Nuevo
        </Button>
      </ViewBar>

      <div className="p-4">
        {view === "table" ? (
          <DataTable
            columns={columns}
            data={filtered}
            density={density}
            enableSelection
            enablePagination
            pageSize={10}
            onRowClick={(r) => {
              // eslint-disable-next-line no-console
              console.log("row click", r);
            }}
          />
        ) : (
          <div className="text-muted-foreground flex h-64 items-center justify-center text-xs">
            Board view — not implemented in this demo
          </div>
        )}
      </div>
    </div>
  );
};

export const DataTableLoading: Story = () => (
  <div className="bg-background p-8">
    <DataTable
      columns={columns}
      data={[]}
      loading
      loadingRows={6}
    />
  </div>
);

export const DataTableEmpty: Story = () => (
  <div className="bg-background p-8">
    <DataTable
      columns={columns}
      data={[]}
      emptyState="No hay reportes que coincidan con tu búsqueda."
    />
  </div>
);

export const DataTableCompact: Story = () => (
  <div className="bg-background p-8">
    <DataTable
      columns={columns}
      data={DEMO_DATA}
      density="compact"
      enablePagination={false}
    />
  </div>
);
