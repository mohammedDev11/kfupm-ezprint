// "use client";

// import {
//   RiLayoutLeftLine,
//   RiLayoutBottomLine,
//   RiLayoutTopLine,
// } from "react-icons/ri";
// import ThemeToggle from "../../actions/ThemeToggle";
// import { cn } from "@/lib/cn";

// export type NavbarMode = "left" | "bottom" | "top";

// type NavbarModeSwitcherProps = {
//   value: NavbarMode;
//   onChange: (mode: NavbarMode) => void;
// };

// const options: Array<{
//   value: NavbarMode;
//   label: string;
//   icon: React.ComponentType<{ className?: string }>;
// }> = [
//   { value: "left", label: "Left", icon: RiLayoutLeftLine },
//   { value: "bottom", label: "Bottom", icon: RiLayoutBottomLine },
//   { value: "top", label: "Top", icon: RiLayoutTopLine },
// ];

// export default function NavbarModeSwitcher({
//   value,
//   onChange,
// }: NavbarModeSwitcherProps) {
//   return (
//     <div className="card inline-flex items-center gap-1 rounded-md p-1.5">
//       {options.map((option) => {
//         const Icon = option.icon;
//         const active = value === option.value;

//         return (
//           <button
//             key={option.value}
//             type="button"
//             onClick={() => onChange(option.value)}
//             className={cn(
//               "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
//               active
//                 ? "bg-brand-500 text-white"
//                 : "text-muted hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
//             )}
//             aria-pressed={active}
//             aria-label={`Set navbar to ${option.label}`}
//           >
//             <Icon className="text-lg" />
//             <span className="hidden sm:inline">{option.label}</span>
//           </button>
//         );
//       })}
//       <ThemeToggle />
//     </div>
//   );
// }

//===============New===============
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  RiLayoutLeftLine,
  RiLayoutBottomLine,
  RiLayoutTopLine,
} from "react-icons/ri";
import { FiSun, FiMoon } from "react-icons/fi";
import { cn } from "@/lib/cn";

export type NavbarMode = "left" | "bottom" | "top";

type NavbarModeSwitcherProps = {
  value: NavbarMode;
  onChange: (mode: NavbarMode) => void;
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
}: NavbarModeSwitcherProps) {
  const [open, setOpen] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeOption =
    options.find((option) => option.value === value) ?? options[0];
  const ActiveIcon = activeOption.icon;

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <div className="fixed right-4 top-4 z-50">
      {/* OUTER VERTICAL GLOW BOX */}
      <div className="relative rounded-2xl">
        {/* soft outer glow */}
        <span
          className="
            pointer-events-none absolute -inset-[1px] rounded-2xl
            bg-gradient-to-b from-blue-500 via-brand-500 to-red-500
            blur-md opacity-60
          "
        />

        {/* thin gradient border */}
        <span
          className="
            pointer-events-none absolute inset-0 rounded-2xl
            bg-gradient-to-b from-blue-500 via-brand-500 to-red-500
            opacity-80
          "
        />

        {/* inner background */}
        <span
          className="
            pointer-events-none absolute inset-[1.5px] rounded-2xl
            bg-[var(--background)]
          "
        />

        {/* content */}
        <div className="relative z-10 flex flex-col items-center gap-3 rounded-2xl p-3">
          {/* THEME TOGGLE */}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-10 w-10 items-center justify-center rounded-xl cursor-pointer transition text-[var(--foreground)]"
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDark ? (
                <FiSun size={20} className="shrink-0" />
              ) : (
                <FiMoon size={20} className="shrink-0" />
              )}
            </button>
          )}

          {/* NAVBAR MODE SWITCHER */}
          <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            {open && <div className="absolute right-full top-0 h-full w-6" />}

            {/* expanding panel */}
            <div
              className={cn(
                "absolute right-full top-1/2 mr-2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg backdrop-blur-sm transition-all duration-300",
                open
                  ? "w-44 translate-x-0 opacity-100"
                  : "pointer-events-none w-0 translate-x-2 opacity-0"
              )}
            >
              <div className="flex flex-col gap-2 p-2">
                {options.map((option) => {
                  const Icon = option.icon;
                  const active = value === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange(option.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition cursor-pointer",
                        active
                          ? "bg-brand-500 text-white"
                          : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                      )}
                      aria-pressed={active}
                      aria-label={`Set navbar to ${option.label}`}
                    >
                      <Icon className="shrink-0 text-lg" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* trigger icon */}
            <button
              type="button"
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 cursor-pointer",
                open && "scale-105"
              )}
              aria-label="Open navbar mode options"
            >
              <ActiveIcon className="text-xl text-[var(--foreground)]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
