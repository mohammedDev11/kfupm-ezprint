"use client";

import Logo from "@/components/shared/page/Logo";
import { cn } from "@/lib/cn";
import { sidebarSectionsByRole, type NavbarRole } from "@/lib/mock-data/Navbar";
import useIsClient from "@/lib/useIsClient";
import { getSession } from "@/services/api";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import DockNavbarBottom from "./DockNavbar/DockNavbarBottom";
import DockNavbarTop from "./DockNavbar/DockNavbarTop";
import GlobalSearch from "./GlobalSearch";
import MobileNavbar from "./MobileNavbar";
import NavbarModeSwitcher, { type NavbarMode } from "./NavbarModeSwitcher";
import SidebarNavbar from "./SidebarNavbar";

const STORAGE_KEY = "ezprint-navbar-mode";

const readStoredMode = (): NavbarMode => {
  if (typeof window === "undefined") return "left";

  const saved = window.localStorage.getItem(STORAGE_KEY);

  return saved === "left" || saved === "bottom" || saved === "top"
    ? saved
    : "left";
};

function FrameUserBadge({
  role,
  isClient,
  placement = "down",
}: {
  role: NavbarRole;
  isClient: boolean;
  placement?: "up" | "down";
}) {
  const [open, setOpen] = useState(false);
  const session = isClient ? getSession(role) : null;
  const fullName =
    session?.user.fullName ||
    (role === "admin" ? "Admin Operator" : "Print User");
  const roleLabel = session?.user.role || (role === "admin" ? "Admin" : "User");
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300"
        style={{
          color: "var(--color-brand-500)",
          background: "rgba(201, 106, 90, 0.12)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Show user profile"
      >
        {initials}
      </button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 z-50 min-w-56 rounded-[1rem] border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl",
            placement === "up"
              ? "bottom-[calc(100%+0.55rem)]"
              : "top-[calc(100%+0.55rem)]",
          )}
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            boxShadow:
              "0 18px 42px rgba(var(--shadow-color), 0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
          role="dialog"
        >
          <p className="whitespace-nowrap font-semibold text-[var(--title)]">
            {fullName}
          </p>
          <p
            className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.24em]"
            style={{ color: "var(--muted)" }}
          >
            {roleLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ShellThemeButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();

  if (!mounted) return null;

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] transition-all duration-300 text-[var(--muted)] hover:text-[var(--color-brand-500)]"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
        boxShadow:
          "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}

export default function NavbarShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: NavbarRole;
}) {
  const [manualMode, setManualMode] = useState<NavbarMode | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isClient = useIsClient();

  const sections = useMemo(() => sidebarSectionsByRole[role], [role]);
  const resolvedMode = manualMode ?? (isClient ? readStoredMode() : "left");

  const handleSidebarMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsSidebarExpanded(true);
  };

  const handleSidebarMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsSidebarExpanded(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleModeChange = (nextMode: NavbarMode) => {
    setManualMode(nextMode);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    }
  };

  const renderContentPanel = () => (
    <main
      className={cn(
        "app-panel flex min-h-0 flex-1 flex-col rounded-none",
        resolvedMode === "left" &&
          "rounded-tl-[1.8rem] rounded-tr-[1.8rem] sm:rounded-tl-[2rem] sm:rounded-tr-[2rem]",
      )}
    >
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="min-h-full">{children}</div>
        </div>
      </div>
    </main>
  );

  const renderShellBar = (placement: "top" | "bottom") => (
    <header
      className={cn(
        "z-20 hidden md:flex items-center justify-between gap-3 px-4 py-3 backdrop-blur-sm",
        placement === "top" ? "border-b" : "border-t",
      )}
      style={{
        background: "var(--background)",
        borderColor: "transparent",
      }}
    >
      <Logo />

      <div className="min-w-0 flex-1 px-4">
        {resolvedMode === "left" ? (
          <GlobalSearch mode="full" role={role} sections={sections} />
        ) : null}
        {resolvedMode === "top" ? (
          <DockNavbarTop sections={sections} inFrame />
        ) : null}
        {resolvedMode === "bottom" ? (
          <DockNavbarBottom sections={sections} inFrame className="mx-auto" />
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {resolvedMode !== "left" ? (
          <GlobalSearch
            mode="compact"
            role={role}
            sections={sections}
            placement={placement === "bottom" ? "up" : "down"}
          />
        ) : null}
        <NavbarModeSwitcher
          value={resolvedMode}
          onChange={handleModeChange}
          placement={placement === "bottom" ? "up" : "down"}
        />
        <ShellThemeButton />
        <FrameUserBadge
          role={role}
          isClient={isClient}
          placement={placement === "bottom" ? "up" : "down"}
        />
      </div>
    </header>
  );

  return (
    <>
      <MobileNavbar sections={sections} />

      <div className="fixed inset-0 flex h-dvh flex-col bg-[var(--background)]">
        {resolvedMode !== "bottom" ? renderShellBar("top") : null}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {resolvedMode === "left" ? (
            <SidebarNavbar
              sections={sections}
              isExpanded={isSidebarExpanded}
              onMouseEnter={handleSidebarMouseEnter}
              onMouseLeave={handleSidebarMouseLeave}
              inFrame
              showBrand={false}
              className={cn(
                "hidden md:flex",
                isSidebarExpanded ? "w-[320px]" : "w-[112px]",
              )}
            />
          ) : null}

          <div className="flex min-h-0 flex-1 overflow-hidden">
            {renderContentPanel()}
          </div>
        </div>

        {resolvedMode === "bottom" ? renderShellBar("bottom") : null}
      </div>
    </>
  );
}
