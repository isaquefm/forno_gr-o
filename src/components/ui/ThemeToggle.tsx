"use client";

import { Coffee, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`grid size-11 cursor-pointer place-items-center rounded-full border border-ink/10 bg-surface text-ink transition-colors hover:border-terracotta hover:text-terracotta focus:outline-none ${className}`}
      aria-label={isDark ? "Alternar para tema claro" : "Alternar para tema café escuro"}
      title={isDark ? "Tema Claro" : "Tema Café Escuro (Dark Roast)"}
    >
      {isDark ? (
        <Sun className="size-4.5 text-amber-300 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Coffee className="size-4.5 text-terracotta transition-transform duration-300 hover:scale-110" />
      )}
    </button>
  );
}
