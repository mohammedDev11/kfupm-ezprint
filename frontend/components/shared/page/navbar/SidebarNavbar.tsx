"use client";

import PreviewVideo from "@/components/ui/video/PreviewVideo";
import { cn } from "@/lib/cn";
import type { SidebarItem, SidebarSection } from "@/lib/mock-data/Navbar";
import useIsClient from "@/lib/useIsClient";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { BrandMark } from "../Logo";

type SidebarNavbarProps = {
  sections: SidebarSection[];
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  side?: "left" | "right";
  inFrame?: boolean;
  className?: string;
  showBrand?: boolean;
};

type SidebarVideoPreviewProps = {
  item: SidebarItem;
  anchorRef: RefObject<HTMLAnchorElement | null>;
  visible: boolean;
  side: "left" | "right";
};

type SidebarNavItemProps = {
  item: SidebarItem;
  isExpanded: boolean;
  pathname: string;
  side: "left" | "right";
};

function SidebarVideoPreview({
  item,
  anchorRef,
  visible,
  side,
}: SidebarVideoPreviewProps) {
  const mounted = useIsClient();
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      setCoords({
        top: rect.top + rect.height / 2,
        left: side === "right" ? rect.left - 18 : rect.right + 18,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible, anchorRef, side]);

  if (!mounted || !visible) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, x: side === "right" ? 8 : -8, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="pointer-events-none fixed z-[99999]"
      style={{
        top: coords.top,
        left: coords.left,
        transform:
          side === "right" ? "translate(-100%, -50%)" : "translateY(-50%)",
      }}
    >
      <div className="relative">
        <div
          className="w-[240px] overflow-hidden rounded-[1.5rem] border p-2.5 shadow-2xl backdrop-blur-xl"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            borderColor: "var(--border)",
            boxShadow:
              "0 22px 56px rgba(var(--shadow-color), 0.3), 0 0 0 1px rgba(var(--support-rgb), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="overflow-hidden rounded-[1.1rem] border border-[var(--border)]">
            <div className="aspect-[16/10] w-full">
              <PreviewVideo
                lightVideoSrc={item.lightVideoSrc}
                darkVideoSrc={item.darkVideoSrc}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="mt-3 px-1">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {item.label}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--muted)" }}>
              Live page preview
            </p>
          </div>
        </div>

        <span
          className={cn(
            "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border",
            side === "right"
              ? "right-0 translate-x-1/2"
              : "left-0 -translate-x-1/2",
          )}
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            borderColor: "var(--border)",
          }}
        />
      </div>
    </motion.div>,
    document.body,
  );
}

function SidebarNavItem({
  item,
  isExpanded,
  pathname,
  side,
}: SidebarNavItemProps) {
  const Icon = item.icon;
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const active =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(`${item.href}/`));

  const hasPreviewVideo = Boolean(item.lightVideoSrc || item.darkVideoSrc);

  return (
    <>
      <Link
        ref={linkRef}
        href={item.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "ezprint-sidebar-link group relative flex h-[3.7rem] items-center rounded-full px-3 transition-all duration-300",
          isExpanded ? "justify-start" : "justify-center",
          active
            ? "ezprint-sidebar-link-active border-transparent text-[var(--color-brand-500)] outline-none ring-0"
            : "text-[var(--paragraph)] hover:text-[var(--color-brand-500)]",
        )}
      >
        {active ? (
          <motion.span
            layoutId="ezprint-sidebar-active-pill"
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="ezprint-sidebar-link-pressed absolute inset-0 rounded-full border-0"
          />
        ) : (
          <span
            className="ezprint-sidebar-link-hover pointer-events-none absolute inset-0 rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100"
          />
        )}

        <span
          className={cn(
            "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300",
            active && "text-[var(--color-brand-500)]",
          )}
        >
          <Icon
            className={cn(
              "text-[1.28rem] transition-all duration-300",
              active
                ? "text-[var(--color-brand-500)]"
                : "text-[var(--muted)] group-hover:text-[var(--color-brand-500)]",
            )}
          />
        </span>

        <span
          className={cn(
            "relative z-10 ml-3 overflow-hidden whitespace-nowrap text-[0.98rem] font-medium tracking-[-0.01em] transition-all duration-300",
            isExpanded ? "max-w-[190px] opacity-100" : "max-w-0 opacity-0",
            active ? "translate-x-0" : "group-hover:translate-x-0.5",
          )}
        >
          {item.label}
        </span>

        {active && isExpanded ? (
          <span
            className="absolute right-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
            style={{
              background: "rgba(var(--support-rgb), 0.95)",
              boxShadow: "0 0 14px rgba(var(--support-rgb), 0.55)",
            }}
          />
        ) : null}
      </Link>

      {isExpanded && hovered && hasPreviewVideo ? (
        <SidebarVideoPreview
          item={item}
          anchorRef={linkRef}
          visible={hovered}
          side={side}
        />
      ) : null}
    </>
  );
}

export default function SidebarNavbar({
  sections,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  side = "left",
  inFrame = false,
  className,
  showBrand = true,
}: SidebarNavbarProps) {
  const pathname = usePathname();
  const workspaceLabel = pathname.startsWith("/sections/admin")
    ? "Admin operations"
    : "User workspace";

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "z-40 transition-[width] duration-300 ease-out",
        inFrame
          ? "relative self-stretch"
          : side === "right"
            ? "fixed right-0 top-0 hidden h-screen lg:flex"
            : "fixed left-0 top-0 hidden h-screen lg:flex",
        inFrame ? "w-full" : isExpanded ? "w-[320px]" : "w-[112px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col p-3",
          inFrame
            ? "h-full min-h-0"
            : "rounded-[1.9rem] border h-full min-h-[calc(100vh-7.5rem)]",
        )}
        style={{
          borderColor: "var(--frame-border)",
          background: inFrame
            ? "transparent"
            : "linear-gradient(180deg, color-mix(in srgb, var(--frame-elevated) 84%, transparent), color-mix(in srgb, var(--frame-background) 94%, transparent))",
          boxShadow: inFrame
            ? "none"
            : "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 48px rgba(var(--shadow-color), 0.14)",
        }}
      >
        {showBrand ? (
          <div className="mb-4 flex min-h-[88px] items-center">
            <Link
              href="/"
              className={cn(
                "group relative flex w-full items-center rounded-[1.5rem] border px-3 py-3 transition-all duration-300",
                isExpanded ? "justify-start" : "justify-center",
              )}
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px rgba(var(--shadow-color), 0.08)",
              }}
            >
              <BrandMark className={isExpanded ? "h-12 w-12" : "h-11 w-11"} />

              <span
                className={cn(
                  "ml-3 overflow-hidden whitespace-nowrap transition-all duration-300",
                  isExpanded
                    ? "max-w-[180px] opacity-100"
                    : "max-w-0 opacity-0",
                )}
              >
                <span className="block text-lg font-semibold tracking-[-0.03em] text-[var(--title)]">
                  EzPrint
                </span>
                <span
                  className="mt-0.5 block text-[0.68rem] font-semibold uppercase tracking-[0.24em]"
                  style={{ color: "var(--muted)" }}
                >
                  {workspaceLabel}
                </span>
              </span>
            </Link>
          </div>
        ) : null}

        <div className="ezprint-sidebar-scroll flex min-h-0 flex-1 flex-col justify-between">
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <div key={section.title}>
                <p
                  className={cn(
                    "mb-3 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.26em] transition-all duration-300",
                    isExpanded
                      ? "max-w-[200px] opacity-100"
                      : "max-w-0 opacity-0",
                  )}
                  style={{ color: "var(--muted)" }}
                >
                  {section.title}
                </p>

                <div className="space-y-2">
                  {section.items.map((item) => (
                    <SidebarNavItem
                      key={item.href}
                      item={item}
                      isExpanded={isExpanded}
                      pathname={pathname}
                      side={side}
                    />
                  ))}
                </div>

                {sectionIndex === 0 ? (
                  <div
                    className="mt-5 h-px w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, var(--border), transparent)",
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "overflow-hidden pt-4 transition-all duration-300",
              isExpanded ? "max-h-32 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div
              className="rounded-[1.5rem] border p-4"
              style={{
                borderColor: "var(--border)",
                background:
                  "linear-gradient(180deg, rgba(var(--brand-rgb), 0.08), rgba(var(--support-rgb), 0.04))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <p
                className="text-[0.66rem] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "var(--muted)" }}
              >
                Guided Preview
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--title)]">
                Hover any destination to preview its live surface before opening
                it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
