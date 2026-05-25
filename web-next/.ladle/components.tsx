import "../app/globals.css";

import type { GlobalProvider } from "@ladle/react";

import { TooltipProvider } from "@/components/ui/tooltip";

export const Provider: GlobalProvider = ({ children, globalState }) => {
  const isDark = globalState.theme === "dark";
  return (
    <div
      className={`min-h-dvh bg-background text-foreground antialiased font-sans ${isDark ? "dark" : ""}`}
    >
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
    </div>
  );
};
