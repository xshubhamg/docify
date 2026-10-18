"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex size-9 cursor-pointer items-center justify-center rounded-lg bg-(--bg-secondary) transition-colors hover:bg-(--bg-tertiary)"
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
