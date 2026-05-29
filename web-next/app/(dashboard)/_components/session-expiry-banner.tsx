"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";

interface Props {
  /** JWT `exp` claim in seconds since epoch. Passed from the RSC layout. */
  exp: number | undefined;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

/**
 * Surfaces upcoming session expiry at T-5min and an "expired" state at T-0.
 *
 * Why: the legacy backend has no JWT refresh endpoint, so we can't extend
 * sessions transparently. The honest UX is to warn the user before expiry so
 * they save their work and re-login cleanly.
 */
export function SessionExpiryBanner({ exp }: Props) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!exp) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [exp]);

  if (!exp) return null;
  const remainingMs = exp * 1000 - now;
  if (remainingMs > FIVE_MINUTES_MS) return null;
  if (dismissed && remainingMs > ONE_MINUTE_MS) return null;

  const isExpired = remainingMs <= 0;
  const minutes = Math.max(0, Math.ceil(remainingMs / ONE_MINUTE_MS));

  async function relogin() {
    try {
      await apiClient("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login?redirect=" + encodeURIComponent(window.location.pathname));
    }
  }

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 border-b border-twenty-orange/40 bg-twenty-orange/10 px-4 py-2 text-sm shadow-sm backdrop-blur"
    >
      <Clock className="size-3.5 text-twenty-orange" />
      <span>
        {isExpired
          ? "Sua sessão expirou. Faça login novamente para continuar."
          : `Sua sessão expira em ${minutes} ${minutes === 1 ? "minuto" : "minutos"}. Salve seu trabalho e entre novamente.`}
      </span>
      <Button size="sm" onClick={relogin} className="h-7">
        {isExpired ? "Ir para login" : "Sair e entrar novamente"}
      </Button>
      {!isExpired && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setDismissed(true)}
          className="size-7"
          aria-label="Dispensar aviso"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
