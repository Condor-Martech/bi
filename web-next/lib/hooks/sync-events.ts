"use client";

import { useEffect } from "react";

import type { SyncEvent } from "@/lib/api/endpoints/notifications";

/**
 * Bus in-process para eventos de sync recibidos por SSE.
 *
 * El `EventSource` vive una sola vez (montado en `NotificationStreamMount`).
 * Esa instancia despacha cada `sync.*` recibido a este bus, y los componentes
 * que quieran escuchar usan `useSyncEvents()` — múltiples suscriptores sin
 * abrir conexiones extra.
 *
 * No usamos `window` como bus para evitar colisiones con eventos del browser
 * y para que esto sea SSR-safe (módulo cargado en server no rompe — el
 * `EventTarget` se crea pero nadie lo usa).
 */
const SYNC_BUS: EventTarget = typeof EventTarget !== "undefined" ? new EventTarget() : ({} as EventTarget);
const SYNC_EVENT_NAME = "sync";

/** Lo llama el listener SSE cuando recibe un evento `sync.*`. */
export function publishSyncEvent(event: SyncEvent): void {
  if (typeof EventTarget === "undefined") return;
  SYNC_BUS.dispatchEvent(new CustomEvent<SyncEvent>(SYNC_EVENT_NAME, { detail: event }));
}

/**
 * Suscribe el componente a TODOS los eventos de sync que llegan por SSE.
 *
 * El handler se trata como "estable por render" — si lo cambiás cada render,
 * el efecto va a re-suscribirse cada vez. Para evitarlo, envolvelo en
 * `useCallback` del lado del caller.
 */
export function useSyncEvents(handler: (event: SyncEvent) => void): void {
  useEffect(() => {
    if (typeof EventTarget === "undefined") return;
    const listener = (e: Event) => handler((e as CustomEvent<SyncEvent>).detail);
    SYNC_BUS.addEventListener(SYNC_EVENT_NAME, listener);
    return () => SYNC_BUS.removeEventListener(SYNC_EVENT_NAME, listener);
  }, [handler]);
}
