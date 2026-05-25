"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MotionButton } from "@/components/ui/_motion/motion-button";
import { apiClient } from "@/lib/api/client";
import { ApiAuthError, ApiError } from "@/lib/api/types";
import { durations } from "@/lib/motion/transitions";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await apiClient("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        const redirect = params.get("redirect") ?? "/";
        router.replace(redirect);
        router.refresh();
      } catch (err) {
        if (err instanceof ApiAuthError) {
          toast.error("Credenciales inválidas.");
        } else if (err instanceof ApiError) {
          toast.error(`Error ${err.status}. Probá de nuevo en un momento.`);
        } else {
          toast.error("No se pudo conectar al servidor.");
        }
      }
    });
  }

  return (
    <Card className="w-full max-w-sm shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>Plataforma Power BI</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>
          <MotionButton
            type="submit"
            disabled={isPending}
            className="w-full"
            wrapperClassName="block w-full"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isPending ? "loader" : "label"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: durations.fast }}
                className="inline-flex items-center gap-2"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {isPending ? "Entrando…" : "Entrar"}
              </motion.span>
            </AnimatePresence>
          </MotionButton>
        </form>
      </CardContent>
    </Card>
  );
}
