"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const options: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemePreference() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <fieldset>
      <legend className="sr-only">Theme</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label, icon: Icon }) => {
          const isActive = mounted && theme === value;

          return (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-(--color-brand)",
                isActive
                  ? "border-(--color-brand) bg-(--color-brand)/10 text-(--color-brand)"
                  : "border-(--border-medium) text-(--text-secondary) hover:bg-(--bg-tertiary)",
              )}
            >
              <input
                type="radio"
                name="theme"
                value={value}
                checked={isActive}
                onChange={() => setTheme(value)}
                className="sr-only"
              />
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
