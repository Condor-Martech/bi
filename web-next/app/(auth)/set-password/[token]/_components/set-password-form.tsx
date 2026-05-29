"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
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

const MIN_LENGTH = 8;

interface Props {
  token: string;
}

export function SetPasswordForm({ token }: Props) {
  const router = useRouter();
  const shown = useShown();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit =
    !isPending &&
    password.length >= MIN_LENGTH &&
    confirm.length >= MIN_LENGTH &&
    password === confirm;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    startTransition(async () => {
      try {
        await apiClient("/api/auth/set-password", {
          method: "POST",
          body: { token, password },
        });
        toast.success("Senha definida. Bem-vindo(a)!");
        router.replace("/");
        router.refresh();
      } catch (err) {
        if (err instanceof ApiAuthError) {
          toast.error("Convite inválido ou expirado. Solicite um novo ao administrador.");
        } else if (err instanceof ApiError) {
          if (err.status === 400) {
            toast.error("Senha inválida. Verifique os requisitos.");
          } else {
            toast.error(`Erro ${err.status}. Tente novamente em instantes.`);
          }
        } else {
          toast.error("Não foi possível conectar ao servidor.");
        }
      }
    });
  }

  return (
    <motion.div
      variants={containerVariants}
      initial={false}
      animate={shown ? "visible" : "hidden"}
      className="space-y-6"
    >
      <motion.header variants={itemVariants} className="space-y-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Defina sua senha
        </h1>
        <p className="text-sm text-muted-foreground">
          Sua conta foi criada. Escolha uma senha para acessar o painel.
        </p>
      </motion.header>

      <motion.form
        variants={itemVariants}
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[12px] font-medium">
            Nova senha
          </Label>
          <InputGroup>
            <InputGroupAddon>
              <Lock aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              required
              minLength={MIN_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              aria-invalid={tooShort}
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
          {tooShort ? (
            <p className="text-[11px] text-destructive">
              A senha deve ter no mínimo {MIN_LENGTH} caracteres.
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-[12px] font-medium">
            Confirmar senha
          </Label>
          <InputGroup>
            <InputGroupAddon>
              <Lock aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              id="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repita a senha"
              required
              minLength={MIN_LENGTH}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={isPending}
              aria-invalid={mismatch}
            />
          </InputGroup>
          {mismatch ? (
            <p className="text-[11px] text-destructive">As senhas não coincidem.</p>
          ) : null}
        </div>

        <MotionButton
          type="submit"
          disabled={!canSubmit}
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
              {isPending ? "Salvando…" : "Definir senha e entrar"}
            </motion.span>
          </AnimatePresence>
        </MotionButton>
      </motion.form>
    </motion.div>
  );
}

function useShown() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(true);
  }, []);
  return shown;
}
