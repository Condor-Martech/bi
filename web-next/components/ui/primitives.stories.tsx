import type { Story } from "@ladle/react";
import { useState } from "react";
import { BarChart3, Inbox, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { InlineEdit } from "@/components/ui/inline-edit";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

function StoryShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background p-8">
      <h2 className="text-foreground mb-1 text-sm font-semibold uppercase tracking-wide">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mb-6 text-xs">{description}</p>
      ) : null}
      {children}
    </div>
  );
}

export const Buttons: Story = () => (
  <StoryShell title="Button" description="Variants y sizes nativos de shadcn.">
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <Plus />
      </Button>
    </div>
  </StoryShell>
);

export const Chips: Story = () => (
  <StoryShell
    title="Chip"
    description="Soft variants Twenty-style. Útiles para estados, tags, categorías."
  >
    <div className="flex flex-wrap gap-2">
      <Chip variant="blue">In progress</Chip>
      <Chip variant="green">Active</Chip>
      <Chip variant="red">Failed</Chip>
      <Chip variant="orange">Pending</Chip>
      <Chip variant="purple">Beta</Chip>
      <Chip variant="pink">New</Chip>
      <Chip variant="gray">Archived</Chip>
      <Chip variant="outline">Outline</Chip>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <Chip variant="blue" size="md">
        Medium size
      </Chip>
      <Chip variant="green" size="sm">
        Small size (default)
      </Chip>
    </div>
  </StoryShell>
);

export const Keyboard: Story = () => (
  <StoryShell
    title="Kbd"
    description="Atajos de teclado estilo Linear. Usá KbdGroup para combos."
  >
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Abrir paleta:</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Buscar:</span>
        <Kbd>/</Kbd>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">Ir a Reports:</span>
        <KbdGroup>
          <Kbd>G</Kbd>
          <Kbd>R</Kbd>
        </KbdGroup>
      </div>
    </div>
  </StoryShell>
);

export const Empty: Story = () => (
  <StoryShell
    title="EmptyState"
    description="Composable. Combinar icon + title + description + actions."
  >
    <div className="border-border rounded-md border">
      <EmptyState>
        <EmptyStateIcon>
          <Inbox />
        </EmptyStateIcon>
        <EmptyStateTitle>Sin reportes</EmptyStateTitle>
        <EmptyStateDescription>
          Aún no creaste ningún reporte en este workspace. Empezá importando
          uno o creando desde cero.
        </EmptyStateDescription>
        <EmptyStateActions>
          <Button variant="outline">
            <BarChart3 />
            Importar
          </Button>
          <Button>
            <Plus />
            Crear reporte
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </div>
  </StoryShell>
);

export const Inline: Story = () => {
  const [name, setName] = useState("Cliente Acme S.A.");
  const [email, setEmail] = useState("");

  return (
    <StoryShell
      title="InlineEdit"
      description="Click para editar. Enter guarda, Escape cancela. validate bloquea el save."
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground w-24 text-xs">Nombre:</span>
          <InlineEdit value={name} onSave={(v) => setName(v)} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground w-24 text-xs">Email:</span>
          <InlineEdit
            value={email}
            placeholder="agregá un email…"
            onSave={(v) => setEmail(v)}
            validate={(v) =>
              v && !v.includes("@") ? "Email inválido" : undefined
            }
          />
        </div>
      </div>
    </StoryShell>
  );
};
