"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MotionButton } from "@/components/ui/_motion/motion-button";
import { apiClient } from "@/lib/api/client";
import { ApiAuthError, ApiError } from "@/lib/api/types";
import { durations, springs } from "@/lib/motion/transitions";

import { ForgotPasswordDialog } from "./_components/forgot-password-dialog";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
};

function useShown() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(true);
  }, []);
  return shown;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const shown = useShown();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

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
          toast.error("Credenciais inválidas.");
        } else if (err instanceof ApiError) {
          toast.error(`Erro ${err.status}. Tente novamente em instantes.`);
        } else {
          toast.error("Não foi possível conectar ao servidor.");
        }
      }
    });
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial={false}
        animate={shown ? "visible" : "hidden"}
        className="space-y-6"
      >
        <motion.header variants={itemVariants} className="space-y-1.5">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesse o painel para explorar seus relatórios.
          </p>
        </motion.header>

        <motion.form
          variants={itemVariants}
          onSubmit={onSubmit}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[12px] font-medium">
              E-mail
            </Label>
            <InputGroup>
              <InputGroupAddon>
                <Mail aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </InputGroup>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="password" className="text-[12px] font-medium">
                Senha
              </Label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-[12px] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none"
              >
                Esqueci minha senha
              </button>
            </div>
            <InputGroup>
              <InputGroupAddon>
                <Lock aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isPending}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={showPassword ? "off" : "on"}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: durations.fast }}
                      className="inline-flex"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </motion.span>
                  </AnimatePresence>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <MotionButton
            type="submit"
            disabled={isPending || !email || !password}
            className="w-full"
            wrapperClassName="block w-full pt-1"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isPending ? "loader" : "label"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: durations.fast }}
                className="inline-flex items-center gap-2"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {isPending ? "Entrando…" : "Entrar"}
              </motion.span>
            </AnimatePresence>
          </MotionButton>
        </motion.form>
      </motion.div>

      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        defaultEmail={email}
      />
    </>
  );
}
