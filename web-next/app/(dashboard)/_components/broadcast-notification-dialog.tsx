"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Megaphone, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MotionButton } from "@/components/ui/_motion/motion-button";
import { Textarea } from "@/components/ui/textarea";
import { useBroadcastNotification } from "@/lib/hooks/notifications";
import { ApiError } from "@/lib/api/types";
import { durations } from "@/lib/motion/transitions";

const TITLE_MAX = 80;
const MESSAGE_MAX = 500;

/**
 * MANAGER-only dialog to broadcast a notification to all users.
 *
 * The legacy `POST /notifications` is gated by `@Roles(MANAGER)`. We do NOT
 * rely on that alone — the parent decides whether to render this button at all
 * based on the session's `role` claim. Defense in depth.
 */
export function BroadcastNotificationDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const broadcast = useBroadcastNotification();

  function reset() {
    setTitle("");
    setMessage("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();
    if (!trimmedTitle || !trimmedMessage) {
      toast.error("Título e mensagem são obrigatórios.");
      return;
    }
    try {
      await broadcast.mutateAsync({ title: trimmedTitle, message: trimmedMessage });
      toast.success("Notificação enviada a todos os usuários.");
      reset();
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error("Apenas um MANAGER pode enviar notificações.");
      } else {
        toast.error("Não foi possível enviar a notificação.");
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Enviar notificação a todos"
          className="h-8 w-8 text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          <Megaphone className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar notificação</DialogTitle>
          <DialogDescription>
            Será entregue em tempo real a todos os usuários do sistema. Não é possível desfazer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bn-title">Título</Label>
            <Input
              id="bn-title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              maxLength={TITLE_MAX}
              placeholder="Novo relatório disponível"
              required
              disabled={broadcast.isPending}
            />
            <span className="self-end text-[10px] text-muted-foreground">
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bn-message">Mensagem</Label>
            <Textarea
              id="bn-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
              maxLength={MESSAGE_MAX}
              rows={4}
              placeholder="Conteúdo da notificação…"
              required
              disabled={broadcast.isPending}
            />
            <span className="self-end text-[10px] text-muted-foreground">
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={broadcast.isPending}
            >
              Cancelar
            </Button>
            <MotionButton type="submit" disabled={broadcast.isPending} className="gap-1.5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={broadcast.isPending ? "loader" : "label"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: durations.fast }}
                  className="inline-flex items-center gap-1.5"
                >
                  {broadcast.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  {broadcast.isPending ? "Enviando…" : "Enviar para todos"}
                </motion.span>
              </AnimatePresence>
            </MotionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
