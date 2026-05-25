import type { Story } from "@ladle/react";

import { Chip } from "@/components/ui/chip";

// ─── helpers ──────────────────────────────────────────────────────────────────

function Swatch({
  label,
  className,
  hex,
  size = "h-16",
}: {
  label: string;
  className: string;
  hex?: string;
  size?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`${size} w-full rounded-md border border-border ${className}`}
      />
      <span className="text-xs font-medium">{label}</span>
      {hex ? (
        <span className="text-muted-foreground font-mono text-[10px]">
          {hex}
        </span>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {children}
      </div>
    </section>
  );
}

// ─── stories ──────────────────────────────────────────────────────────────────

export const Palette: Story = () => (
  <div className="p-8">
    <Section title="Background / foreground">
      <Swatch label="background" className="bg-background" />
      <Swatch label="card" className="bg-card" />
      <Swatch label="popover" className="bg-popover" />
      <Swatch label="muted" className="bg-muted" />
      <Swatch label="accent" className="bg-accent" />
      <Swatch label="sidebar" className="bg-sidebar" />
    </Section>

    <Section title="Twenty accents">
      <Swatch label="twenty-blue" className="bg-twenty-blue" />
      <Swatch label="twenty-green" className="bg-twenty-green" />
      <Swatch label="twenty-red" className="bg-twenty-red" />
      <Swatch label="twenty-orange" className="bg-twenty-orange" />
      <Swatch label="twenty-purple" className="bg-twenty-purple" />
      <Swatch label="twenty-pink" className="bg-twenty-pink" />
      <Swatch label="twenty-gray" className="bg-twenty-gray" />
    </Section>

    <Section title="States semánticos">
      <Swatch label="primary" className="bg-primary" />
      <Swatch label="destructive" className="bg-destructive" />
      <Swatch label="success" className="bg-success" />
      <Swatch label="warning" className="bg-warning" />
      <Swatch label="info" className="bg-info" />
    </Section>
  </div>
);

export const SoftVariants: Story = () => (
  <div className="p-8">
    <h2 className="text-foreground mb-1 text-sm font-semibold uppercase tracking-wide">
      Soft variants (chips)
    </h2>
    <p className="text-muted-foreground mb-6 text-xs">
      Light mode usa 8-12% de tint sobre el background. Dark mode sube a 14-20%
      para mantener contraste.
    </p>
    <div className="flex flex-wrap gap-2">
      <Chip variant="blue">blue</Chip>
      <Chip variant="green">green</Chip>
      <Chip variant="red">red</Chip>
      <Chip variant="orange">orange</Chip>
      <Chip variant="purple">purple</Chip>
      <Chip variant="pink">pink</Chip>
      <Chip variant="gray">gray</Chip>
      <Chip variant="outline">outline</Chip>
    </div>

    <h3 className="text-foreground mb-2 mt-8 text-sm font-medium">
      Surfaces como utilities (raw)
    </h3>
    <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      <Swatch label="bg-blue-soft" className="bg-blue-soft" />
      <Swatch label="bg-green-soft" className="bg-green-soft" />
      <Swatch label="bg-red-soft" className="bg-red-soft" />
      <Swatch label="bg-orange-soft" className="bg-orange-soft" />
      <Swatch label="bg-purple-soft" className="bg-purple-soft" />
      <Swatch label="bg-pink-soft" className="bg-pink-soft" />
      <Swatch label="bg-gray-soft" className="bg-gray-soft" />
    </div>
  </div>
);

export const Surfaces: Story = () => (
  <div className="bg-surface-base p-8">
    <h2 className="text-foreground mb-1 text-sm font-semibold uppercase tracking-wide">
      Layered surfaces (z-axis)
    </h2>
    <p className="text-muted-foreground mb-6 text-xs">
      Twenty/Linear apilan superficies para crear jerarquía visual. base → raised
      → overlay → floating. Cada una sube un tono sobre la anterior.
    </p>
    <div className="space-y-4">
      <div className="bg-surface-base border-border rounded-md border p-4">
        surface-base
        <div className="bg-surface-raised border-border mt-3 rounded-md border p-4">
          surface-raised
          <div className="bg-surface-overlay border-border mt-3 rounded-md border p-4">
            surface-overlay
            <div className="bg-surface-floating border-border shadow-lg mt-3 rounded-md border p-4">
              surface-floating (con shadow-lg)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Elevation: Story = () => (
  <div className="p-8">
    <h2 className="text-foreground mb-1 text-sm font-semibold uppercase tracking-wide">
      Elevation / shadows
    </h2>
    <p className="text-muted-foreground mb-6 text-xs">
      Tints con <code>oklch</code>. En dark mode las opacidades son más fuertes
      (30-70%) para destacar sobre <code>#161616</code>.
    </p>
    <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
      {(
        [
          ["xs", "shadow-xs"],
          ["sm", "shadow-sm"],
          ["md", "shadow-md"],
          ["lg", "shadow-lg"],
          ["xl", "shadow-xl"],
        ] as const
      ).map(([key, cls]) => (
        <div key={key} className="flex flex-col items-center gap-3">
          <div className={`bg-surface-floating rounded-md h-20 w-full ${cls}`} />
          <code className="text-muted-foreground text-xs">{cls}</code>
        </div>
      ))}
    </div>
  </div>
);

export const Typography: Story = () => (
  <div className="p-8">
    <h2 className="text-foreground mb-6 text-sm font-semibold uppercase tracking-wide">
      Typography scale (Twenty dense)
    </h2>
    <div className="space-y-4">
      {(
        [
          ["text-xs", "11px", "The quick brown fox jumps over the lazy dog"],
          ["text-sm", "12px", "The quick brown fox jumps over the lazy dog"],
          ["text-base", "13px (default body)", "The quick brown fox jumps over the lazy dog"],
          ["text-lg", "14px", "The quick brown fox jumps over the lazy dog"],
          ["text-xl", "16px", "The quick brown fox jumps"],
          ["text-2xl", "20px", "The quick brown fox"],
          ["text-3xl", "24px", "The quick brown fox"],
        ] as const
      ).map(([cls, hint, text]) => (
        <div key={cls} className="flex items-baseline gap-6">
          <code className="text-muted-foreground w-24 shrink-0 text-xs">
            {cls}
          </code>
          <span className="text-muted-foreground w-32 shrink-0 text-xs">
            {hint}
          </span>
          <span className={cls}>{text}</span>
        </div>
      ))}
    </div>

    <h3 className="text-foreground mb-3 mt-10 text-sm font-semibold uppercase tracking-wide">
      Font weights
    </h3>
    <div className="space-y-2 text-base">
      <p className="font-normal">font-normal · 400 — Regular</p>
      <p className="font-medium">font-medium · 500 — Medium</p>
      <p className="font-semibold">font-semibold · 600 — Semibold</p>
      <p className="font-bold">font-bold · 700 — Bold</p>
    </div>

    <h3 className="text-foreground mb-3 mt-10 text-sm font-semibold uppercase tracking-wide">
      Font family
    </h3>
    <div className="space-y-2 text-base">
      <p className="font-sans">font-sans — Inter (UI con cv11, ss01, ss03)</p>
      <p className="font-mono">font-mono — IBM Plex Mono (code, data, time)</p>
    </div>
  </div>
);
