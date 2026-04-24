"use client";

import { cn } from "@/lib/cn";
import type { NavbarRole, SidebarSection } from "@/lib/mock-data/Navbar";
import useIsClient from "@/lib/useIsClient";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiSearch } from "react-icons/fi";

type GlobalSearchMode = "full" | "compact";

type GlobalSearchProps = {
  mode: GlobalSearchMode;
  role: NavbarRole;
  sections: SidebarSection[];
  placement?: "up" | "down";
};

type SearchSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
  keywords: string;
};

const extraSuggestionsByRole: Record<NavbarRole, SearchSuggestion[]> = {
  admin: [
    {
      id: "admin-search-users",
      title: "Find users",
      subtitle: "Search student and staff accounts",
      href: "/sections/admin/users",
      keywords: "users accounts students staff people",
    },
    {
      id: "admin-search-printers",
      title: "Find printers",
      subtitle: "Printer health, location, and status",
      href: "/sections/admin/printers",
      keywords: "printers devices status locations toner",
    },
    {
      id: "admin-search-groups",
      title: "Find groups",
      subtitle: "Printing groups and access rules",
      href: "/sections/admin/groups",
      keywords: "groups access permissions departments",
    },
    {
      id: "admin-search-reports",
      title: "Open reports",
      subtitle: "Exports, activity, and usage analytics",
      href: "/sections/admin/reports",
      keywords: "reports analytics exports usage",
    },
  ],
  user: [
    {
      id: "user-search-printers",
      title: "Choose a printer",
      subtitle: "Start a print job",
      href: "/sections/user/print",
      keywords: "printer print upload file",
    },
    {
      id: "user-search-jobs",
      title: "Find print jobs",
      subtitle: "Recent, pending, and released jobs",
      href: "/sections/user/recent-print-jobs",
      keywords: "jobs recent pending history release",
    },
    {
      id: "user-search-wallet",
      title: "Check wallet",
      subtitle: "Balance, quota, and transactions",
      href: "/sections/user/wallet",
      keywords: "wallet balance quota transactions",
    },
  ],
};

const normalize = (value: string) => value.trim().toLowerCase();

export default function GlobalSearch({
  mode,
  role,
  sections,
  placement = "down",
}: GlobalSearchProps) {
  const router = useRouter();
  const mounted = useIsClient();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const routeSuggestions = sections.flatMap((section) =>
      section.items.map((item) => ({
        id: `${section.title}-${item.href}`,
        title: item.label,
        subtitle: section.title,
        href: item.href,
        keywords: `${item.label} ${section.title} ${item.href}`,
      })),
    );

    return [...routeSuggestions, ...extraSuggestionsByRole[role]];
  }, [role, sections]);

  const filteredSuggestions = useMemo(() => {
    const search = normalize(query);
    const filtered = search
      ? suggestions.filter((item) =>
          normalize(`${item.title} ${item.subtitle} ${item.keywords}`).includes(
            search,
          ),
        )
      : suggestions;

    return filtered.slice(0, 8);
  }, [query, suggestions]);

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || (!event.metaKey && !event.ctrlKey)) {
        return;
      }

      event.preventDefault();

      if (mode === "full") {
        inputRef.current?.focus();
        setOpen(true);
        setActiveIndex(0);
        return;
      }

      setOpen(true);
      setActiveIndex(0);
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [mode]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  useEffect(() => {
    if (!open || mode !== "full") return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mode, open]);

  useEffect(() => {
    if (open && mode === "compact") {
      inputRef.current?.focus();
    }
  }, [mode, open]);

  const navigateTo = (suggestion: SearchSuggestion) => {
    if (!suggestion.href) return;

    setOpen(false);
    setQuery("");
    router.push(suggestion.href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        Math.min(current + 1, filteredSuggestions.length - 1),
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = filteredSuggestions[activeIndex];
      if (selected) navigateTo(selected);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const searchInput = (
    <div
      className="relative"
      onFocus={() => setOpen(true)}
      onMouseDown={() => setOpen(true)}
    >
      <FiSearch
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        size={18}
      />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search sections, users, printers...  ⌘K"
        className="h-11 w-full rounded-[1rem] border bg-transparent pl-11 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-[var(--muted)]"
        style={{
          borderColor: "var(--border)",
          color: "var(--title)",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
          boxShadow:
            "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );

  const suggestionList = (
    <div
      className={cn(
        "z-50 rounded-[1rem] border p-2 shadow-2xl backdrop-blur-xl",
        mode === "compact"
          ? "relative mt-2 max-h-[min(52vh,26rem)] w-full overflow-y-auto"
          : cn(
              "absolute right-0 w-[min(30rem,calc(100vw-2rem))] overflow-hidden",
              "left-0 right-auto w-full min-w-[24rem]",
              placement === "up"
                ? "bottom-[calc(100%+0.5rem)]"
                : "top-[calc(100%+0.5rem)]",
            ),
      )}
      style={{
        borderColor: "var(--border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--surface) 97%, transparent), color-mix(in srgb, var(--surface-2) 97%, transparent))",
        boxShadow:
          "0 22px 54px rgba(var(--shadow-color), 0.22), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {filteredSuggestions.length > 0 ? (
        filteredSuggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            type="button"
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => navigateTo(suggestion)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-[0.85rem] px-3 py-3 text-left transition-all duration-150",
              index === activeIndex
                ? "text-[var(--color-brand-500)]"
                : "text-[var(--title)]",
            )}
            style={{
              background:
                index === activeIndex ? "rgba(var(--brand-rgb), 0.12)" : "transparent",
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem]"
              style={{ background: "rgba(var(--brand-rgb), 0.1)" }}
            >
              <FiSearch size={16} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {suggestion.title}
              </span>
              <span
                className="block truncate text-xs"
                style={{ color: "var(--muted)" }}
              >
                {suggestion.subtitle}
              </span>
            </span>
          </button>
        ))
      ) : (
        <div className="px-3 py-5 text-center text-sm text-[var(--muted)]">
          No matches found
        </div>
      )}
    </div>
  );

  if (mode === "compact") {
    const commandOverlay =
      mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto p-4 pt-[clamp(2rem,10vh,6rem)] pb-[clamp(5rem,14vh,8rem)]"
              role="dialog"
              aria-modal="true"
              aria-label="Global search"
            >
              <button
                type="button"
                aria-label="Close search"
                className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              <div className="relative z-10 w-full max-w-2xl">
                {searchInput}
                {suggestionList}
              </div>
            </div>,
            document.body,
          )
        : null;

    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[1rem] transition-all duration-300 text-[var(--muted)] hover:text-[var(--color-brand-500)]"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
            boxShadow:
              "0 10px 24px rgba(var(--shadow-color), 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
          aria-label="Open search"
        >
          <FiSearch size={18} />
        </button>

        {commandOverlay}
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-xl">
      {searchInput}
      {open ? suggestionList : null}
    </div>
  );
}
