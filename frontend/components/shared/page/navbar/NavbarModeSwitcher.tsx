"use client";

import { cn } from "@/lib/cn";
import useIsClient from "@/lib/useIsClient";
import { useTheme } from "next-themes";
import { FiMoon, FiSun } from "react-icons/fi";
import {
  RiLayoutBottomLine,
  RiLayoutLeftLine,
  RiLayoutTopLine,
} from "react-icons/ri";

export type NavbarMode = "left" | "bottom" | "top";

type NavbarModeSwitcherProps = {
  value: NavbarMode;
  onChange: (mode: NavbarMode) => void;
  className?: string;
};

type Option = {
  value: NavbarMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const options: Option[] = [
  { value: "left", label: "Left", icon: RiLayoutLeftLine },
  { value: "bottom", label: "Bottom", icon: RiLayoutBottomLine },
  { value: "top", label: "Top", icon: RiLayoutTopLine },
];

export default function NavbarModeSwitcher({
  value,
  onChange,
  className,
}: NavbarModeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <div
      className={cn("flex items-center gap-1 rounded-[1rem] p-1", className)}
      style={{
        background: "rgba(148, 163, 184, 0.08)",
      }}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex h-11 items-center justify-center gap-2 rounded-[0.9rem] px-3 text-sm font-medium transition-all duration-300",
              active
                ? "text-[var(--color-brand-500)]"
                : "text-[var(--muted)] hover:text-[var(--color-brand-500)]",
            )}
            style={{
              background: active ? "rgba(201, 106, 90, 0.12)" : "transparent",
            }}
            aria-pressed={active}
            aria-label={`Set navbar to ${option.label}`}
          >
            <Icon className="shrink-0 text-lg" />
            <span className="hidden xl:inline">{option.label}</span>
          </button>
        );
      })}

      {mounted ? (
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[0.95rem] transition-all duration-300 text-[var(--muted)] hover:text-[var(--color-brand-500)]"
          style={{
            background: "transparent",
          }}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      ) : null}
    </div>
  );
}
