"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 !px-0 opacity-50">
        <Sun size={20} strokeWidth={2.25} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="w-9 h-9 !px-0"
      aria-label="Temayı değiştir"
      title="Temayı değiştir"
    >
      {resolvedTheme === "dark" ? (
        <Moon size={20} strokeWidth={2.25} />
      ) : (
        <Sun size={20} strokeWidth={2.25} />
      )}
      <span className="sr-only">Tema Değiştir</span>
    </Button>
  );
}
