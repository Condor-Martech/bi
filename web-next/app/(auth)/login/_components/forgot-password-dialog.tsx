"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, KeyRound, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MotionButton } from "@/components/ui/_motion/motion-button";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import { durations, springs } from "@/lib/motion/transitions";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

type Status = "idle" | "success";

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  defaultEmail = "",
}: ForgotPasswordDialogProps) {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<Status>("idle");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setStatus("idle");
    }
  }, [open, defaultEmail]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    startTransition(async () => {
      try {
        await apiClient(`/api/users/forget/pass/${encodeURIComponent(trimmed)}`, {
          method: "PATCH",
        });
        setStatus("success");
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            toast.error("E-mail não encontrado.");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/15">
            <AnimatePresence mode="wait" initial={false}>
              {status === "success" ? (
                <motion.span
                  key="check"
                  initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={springs.fast}
                  className="inline-flex"
                >
                  <Check className="size-4.5" strokeWidth={2.5} />
                </motion.span>
              ) : (
                <motion.span
                  key="key"
                  initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={springs.fast}
                  className="inline-flex"
                >
                  <KeyRound className="size-4.5" strokeWidth={2.25} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <DialogTitle>
            {status === "success" ? "Verifique seu e-mail" : "Recuperar senha"}
          </DialogTitle>
          <DialogDescription>
            {status === "success"
              ? "Enviamos uma nova senha provisória. Acesse com ela e altere assim que possível."
              : "Informe o e-mail cadastrado. Você receberá uma nova senha provisória."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait" initial={false}>
          {status === "idle" ? (
            <motion.form
              key="form"
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: durations.fast }}
              onSubmit={onSubmit}
              className="space-y-3"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-[12px] font-medium">
                  E-mail
                </Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Mail aria-hidden />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                  />
                </InputGroup>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <MotionButton
                  type="submit"
                  disabled={isPending || !email.trim()}
                  wrapperClassName="block"
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
                      {isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : null}
                      {isPending ? "Enviando…" : "Enviar nova senha"}
                    </motion.span>
                  </AnimatePresence>
                </MotionButton>
              </DialogFooter>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: durations.fast }}
              className="space-y-3"
            >
              <div className="rounded-md border border-border bg-muted/40 p-3 text-[12px] text-muted-foreground">
                Enviado para{" "}
                <span className="font-medium text-foreground">{email.trim()}</span>.
                Se não chegar em alguns minutos, confira a pasta de spam.
              </div>
              <DialogFooter>
                <Button onClick={() => onOpenChange(false)}>Entendi</Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
