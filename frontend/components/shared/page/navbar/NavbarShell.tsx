"use client";

import Logo from "@/components/shared/page/Logo";
import { cn } from "@/lib/cn";
import { sidebarSectionsByRole, type NavbarRole } from "@/lib/mock-data/Navbar";
import useIsClient from "@/lib/useIsClient";
import { getSession } from "@/services/api";
import { useEffect, useMemo, useRef, useState } from "react";
import DockNavbarBottom from "./DockNavbar/DockNavbarBottom";
import DockNavbarTop from "./DockNavbar/DockNavbarTop";
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
}: {
  role: NavbarRole;
  isClient: boolean;
}) {
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
      className="flex items-center gap-2 text-sm"
      style={{
        color: "var(--foreground)",
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
        style={{
          color: "var(--color-brand-500)",
          background: "rgba(201, 106, 90, 0.12)",
        }}
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="hidden xl:block">
        <p className="font-semibold text-[var(--title)]">{fullName}</p>
        <p
          className="text-[0.66rem] font-semibold uppercase tracking-[0.24em]"
          style={{ color: "var(--muted)" }}
        >
          {roleLabel}
        </p>
      </div>
    </div>
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
    <main className="app-panel flex min-h-0 flex-1 flex-col rounded-none rounded-tl-[1.8rem] sm:rounded-tl-[2rem]">
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "p-4 sm:p-6 lg:p-8",
            resolvedMode === "bottom" && "pb-28",
          )}
        >
          <div className="min-h-full">{children}</div>
        </div>
      </div>
    </main>
  );

  return (
    <>
      <MobileNavbar sections={sections} />

      <div className="fixed inset-0 flex h-dvh flex-col bg-[var(--background)]">
        <header
          className="z-20 hidden md:flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-sm"
          style={{
            background: "var(--background)",
            borderColor: "transparent",
          }}
        >
          <Logo />

          <div className="flex-1 px-4">
            {resolvedMode === "top" ? (
              <DockNavbarTop sections={sections} inFrame />
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <NavbarModeSwitcher
              value={resolvedMode}
              onChange={handleModeChange}
            />
            <FrameUserBadge role={role} isClient={isClient} />
          </div>
        </header>

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

        {resolvedMode === "bottom" ? (
          <div
            className="z-20 border-t"
            style={{
              borderColor: "var(--frame-border)",
              background: "var(--frame-background)",
            }}
          >
            <DockNavbarBottom
              sections={sections}
              inFrame={false}
              className="mx-auto w-full"
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
