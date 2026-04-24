"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";
import type { NavbarMode } from "./navbar/NavbarModeSwitcher";

const navbarModeStorageKey = "ezprint-navbar-mode";

type SectionBadgeProps = {
  title: string;
  className?: string;
};

const readNavbarMode = (): NavbarMode => {
  if (typeof window === "undefined") return "left";

  const saved = window.localStorage.getItem(navbarModeStorageKey);

  return saved === "left" ||
    saved === "right" ||
    saved === "bottom" ||
    saved === "top"
    ? saved
    : "left";
};

export default function SectionBadge({ title, className }: SectionBadgeProps) {
  const [navbarMode, setNavbarMode] = useState<NavbarMode>("left");
  const isRightMode = navbarMode === "right";

  useEffect(() => {
    setNavbarMode(readNavbarMode());

    const handleNavbarModeChange = (event: Event) => {
      const nextMode = (event as CustomEvent<NavbarMode>).detail;

      if (
        nextMode === "left" ||
        nextMode === "right" ||
        nextMode === "bottom" ||
        nextMode === "top"
      ) {
        setNavbarMode(nextMode);
      }
    };

    window.addEventListener(
      "ezprint-navbar-mode-change",
      handleNavbarModeChange,
    );

    return () => {
      window.removeEventListener(
        "ezprint-navbar-mode-change",
        handleNavbarModeChange,
      );
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-20 -top-4 sm:-top-6 lg:-top-8",
        isRightMode
          ? "-left-4 sm:-left-6 lg:-left-8"
          : "-right-4 sm:-right-6 lg:-right-8",
        className,
      )}
    >
      <div
        className={cn(
          "ezprint-section-badge-inner min-w-[150px] px-6 py-3.5 shadow-2xl sm:min-w-[170px] sm:px-7 sm:py-4",
          isRightMode
            ? "rounded-br-[1.45rem]"
            : "rounded-bl-[1.45rem]",
        )}
        style={{
          transformOrigin: isRightMode ? "top left" : "top right",
        }}
      >
        <h1
          key={`${title}-${isRightMode ? "right" : "left"}`}
          className={cn(
            "ezprint-section-badge-text text-center text-base font-semibold tracking-[-0.01em] text-[var(--title)] sm:text-lg",
            isRightMode
              ? "ezprint-section-badge-text-from-left"
              : "ezprint-section-badge-text-from-right",
          )}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
