"use client";

import * as React from "react";
import { Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  onSave: (next: string) => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Devuelve un mensaje de error para bloquear el save, o undefined para permitir. */
  validate?: (next: string) => string | undefined;
}

function InlineEdit({
  value,
  onSave,
  onCancel,
  placeholder = "Vacío",
  disabled = false,
  className,
  validate,
}: InlineEditProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const committedRef = React.useRef(false);

  React.useEffect(() => {
    if (editing) {
      committedRef.current = false;
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const cancel = React.useCallback(() => {
    committedRef.current = true;
    setDraft(value);
    setError(undefined);
    setEditing(false);
    onCancel?.();
  }, [value, onCancel]);

  const commit = React.useCallback(async () => {
    if (committedRef.current) return;
    if (draft === value) {
      committedRef.current = true;
      setEditing(false);
      return;
    }
    const validation = validate?.(draft);
    if (validation) {
      setError(validation);
      return;
    }
    committedRef.current = true;
    try {
      setPending(true);
      await onSave(draft);
      setEditing(false);
      setError(undefined);
    } catch (err) {
      committedRef.current = false;
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setPending(false);
    }
  }, [draft, value, onSave, validate]);

  if (!editing) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setEditing(true)}
        data-slot="inline-edit-trigger"
        data-empty={!value}
        className={cn(
          "group inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-left text-sm",
          "hover:bg-accent disabled:pointer-events-none disabled:opacity-50",
          "data-[empty=true]:text-muted-foreground",
          className,
        )}
      >
        <span>{value || placeholder}</span>
        <Pencil className="text-muted-foreground size-3 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <div
      data-slot="inline-edit-active"
      className="inline-flex flex-col gap-0.5"
    >
      <input
        ref={inputRef}
        value={draft}
        disabled={pending}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        className={cn(
          "bg-background border-input focus-visible:border-ring focus-visible:ring-ring/35 inline-block h-7 rounded-sm border px-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none",
          "disabled:cursor-wait disabled:opacity-50",
          error &&
            "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/35",
          className,
        )}
      />
      {error ? (
        <span
          data-slot="inline-edit-error"
          className="text-destructive text-xs"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}

export { InlineEdit, type InlineEditProps };
