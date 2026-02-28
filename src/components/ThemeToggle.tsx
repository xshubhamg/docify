"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative size-9 rounded-lg bg-(--bg-secondary) flex items-center justify-center cursor-pointer hover:bg-(--bg-tertiary) transition-colors"
      aria-label="Toggle theme"
    >
      {mounted ? (
        theme === "dark" ? (
          <Sun className="size-[18px] text-(--text-primary)" />
        ) : (
          <Moon className="size-[18px] text-(--text-primary)" />
        )
      ) : (
        <span className="size-[18px]" />
      )}
    </button>
  );
}
