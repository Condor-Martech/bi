"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

function ViewBar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="view-bar"
      className={cn(
        "bg-background border-border flex h-10 w-full items-center gap-2 border-b px-3",
        className,
      )}
      {...props}
    />
  );
}

function ViewBarSection({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="view-bar-section"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function ViewBarSpacer({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="view-bar-spacer" className={cn("flex-1", className)} {...props} />;
}

function ViewBarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="view-bar-separator"
      orientation="vertical"
      className={cn("h-5", className)}
      {...props}
    />
  );
}

interface ViewBarSearchProps
  extends Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> {
  value: string;
  onValueChange: (next: string) => void;
}

function ViewBarSearch({
  value,
  onValueChange,
  placeholder = "Buscar…",
  className,
  ...props
}: ViewBarSearchProps) {
  return (
    <div data-slot="view-bar-search" className="relative">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-7 w-48 pr-7 pl-7 text-xs", className)}
        {...props}
      />
      {value ? (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onValueChange("")}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

type DensityValue = "cozy" | "compact";

interface ViewBarDensityProps {
  value: DensityValue;
  onValueChange: (next: DensityValue) => void;
  className?: string;
}

function ViewBarDensity({
  value,
  onValueChange,
  className,
}: ViewBarDensityProps) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={value}
      onValueChange={(v) => v && onValueChange(v as DensityValue)}
      className={cn("h-7", className)}
      data-slot="view-bar-density"
    >
      <ToggleGroupItem value="cozy" aria-label="Cozy" className="h-7 px-2 text-xs">
        Cozy
      </ToggleGroupItem>
      <ToggleGroupItem
        value="compact"
        aria-label="Compact"
        className="h-7 px-2 text-xs"
      >
        Compact
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

interface ViewBarViewSwitcherProps<T extends string> {
  value: T;
  onValueChange: (next: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  className?: string;
}

function ViewBarViewSwitcher<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: ViewBarViewSwitcherProps<T>) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      className={cn("h-7", className)}
      data-slot="view-bar-view-switcher"
    >
      {options.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          aria-label={opt.label}
          className="h-7 gap-1 px-2 text-xs"
        >
          {opt.icon}
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

interface ViewBarActionProps extends React.ComponentProps<typeof Button> {
  active?: boolean;
}

function ViewBarAction({
  className,
  active = false,
  variant = "ghost",
  size = "sm",
  ...props
}: ViewBarActionProps) {
  return (
    <Button
      data-slot="view-bar-action"
      data-active={active}
      variant={variant}
      size={size}
      className={cn(
        "h-7 gap-1.5 px-2 text-xs",
        "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  ViewBar,
  ViewBarSection,
  ViewBarSpacer,
  ViewBarSeparator,
  ViewBarSearch,
  ViewBarDensity,
  ViewBarViewSwitcher,
  ViewBarAction,
  type DensityValue,
};
