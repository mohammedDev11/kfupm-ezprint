"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type ListBoxOption = {
  value: string;
  label?: React.ReactNode;
  selectedLabel?: React.ReactNode;
  searchText?: string;
  disabled?: boolean;
};

type ListBoxProps = {
  children?: React.ReactNode;
  options: Array<string | ListBoxOption>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  optionClassName?: string;
  maxHeightClassName?: string;
  align?: "left" | "right";
  ariaLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  combobox?: boolean;
  clearSearchOnSelect?: boolean;
};

export default function ListBox({
  children,
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Select",
  disabled = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  optionClassName = "",
  maxHeightClassName = "max-h-64",
  align = "left",
  ariaLabel,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  combobox = false,
  clearSearchOnSelect = true,
}: ListBoxProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string"
          ? { value: option, label: option }
          : { label: option.value, ...option },
      ),
    [options],
  );

  const selectedValue = value ?? internalValue;
  const selectedOption = normalizedOptions.find(
    (option) => option.value === selectedValue,
  );
  const getOptionText = (option: ListBoxOption) => {
    if (typeof option.selectedLabel === "string") return option.selectedLabel;
    if (typeof option.label === "string") return option.label;
    return option.value;
  };
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!searchable || !term) {
      return normalizedOptions;
    }

    return normalizedOptions.filter((option) => {
      const labelText =
        typeof option.label === "string" ? option.label : option.value;
      const searchText = `${option.searchText || ""} ${labelText} ${option.value}`;

      return searchText.toLowerCase().includes(term);
    });
  }, [normalizedOptions, searchTerm, searchable]);

  useEffect(() => {
    if (!combobox) return;

    const nextSearchTerm =
      !selectedValue
        ? ""
        : selectedOption && !clearSearchOnSelect
        ? getOptionText(selectedOption)
        : null;

    if (nextSearchTerm === null) {
      return;
    }

    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        setSearchTerm(nextSearchTerm);
      }
    });

    return () => {
      isActive = false;
    };
  }, [clearSearchOnSelect, combobox, selectedOption, selectedValue]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (option: ListBoxOption) => {
    if (option.disabled) return;

    if (value === undefined) {
      setInternalValue(option.value);
    }

    onValueChange?.(option.value);
    setOpen(false);
    setSearchTerm(clearSearchOnSelect ? "" : getOptionText(option));
  };

  const handleComboboxKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option =
        filteredOptions[Math.min(activeIndex, filteredOptions.length - 1)];

      if (option) {
        handleSelect(option);
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {combobox ? (
        <div
          className={cn(
            "flex w-full items-center gap-3 rounded-md border px-4 py-2.5 text-left transition focus-within:ring-4 focus-within:ring-[rgba(var(--brand-rgb),0.16)]",
            disabled ? "pointer-events-none opacity-50" : "",
            triggerClassName,
          )}
          style={{
            background: "var(--surface)",
            borderColor: open
              ? "color-mix(in srgb, var(--color-brand-500) 34%, var(--border))"
              : "var(--border)",
            color: "var(--foreground)",
          }}
        >
          <Search className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            type="text"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            aria-label={ariaLabel}
            aria-controls={open ? `${ariaLabel || "listbox"}-options` : undefined}
            value={searchTerm}
            placeholder={
              typeof placeholder === "string" ? placeholder : searchPlaceholder
            }
            onFocus={() => {
              setOpen(true);
              setActiveIndex(0);
            }}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onKeyDown={handleComboboxKeyDown}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--title)] outline-none placeholder:text-[var(--muted)]"
          />
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform",
              open ? "rotate-180" : "",
            )}
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--brand-rgb),0.16)] disabled:pointer-events-none disabled:opacity-50",
            triggerClassName,
          )}
          style={{
            background: "var(--surface)",
            borderColor: open
              ? "color-mix(in srgb, var(--color-brand-500) 34%, var(--border))"
              : "var(--border)",
            color: selectedOption ? "var(--foreground)" : "var(--muted)",
          }}
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {selectedOption?.selectedLabel ??
              selectedOption?.label ??
              placeholder}
          </span>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform",
              open ? "rotate-180" : "",
            )}
          />
        </button>
      )}

      {open ? (
        <div
          role="listbox"
          id={`${ariaLabel || "listbox"}-options`}
          className={cn(
            "absolute top-[calc(100%+10px)] z-50 w-full overflow-hidden rounded-md border p-2 shadow-xl",
            align === "right" ? "right-0" : "left-0",
            contentClassName,
          )}
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "0 14px 40px rgba(var(--shadow-color), 0.16)",
          }}
        >
          {searchable && !combobox ? (
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm font-medium outline-none transition focus:border-brand-500/50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--title)",
                }}
              />
            </div>
          ) : null}

          <div className={cn("overflow-y-auto", maxHeightClassName)}>
            {children ? (
              children
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-sm font-medium text-[var(--muted)]">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === selectedValue;
                const isActive = combobox && index === activeIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--surface-2)] disabled:pointer-events-none disabled:opacity-50",
                      isSelected || isActive
                        ? "bg-[var(--surface-2)]"
                        : "bg-transparent",
                      optionClassName,
                    )}
                    style={{
                      color: "var(--paragraph)",
                    }}
                  >
                    <div className="min-w-0 flex-1 truncate">
                      {option.label}
                    </div>

                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {isSelected ? (
                        <Check
                          className="h-4 w-4"
                          style={{ color: "var(--color-brand-500)" }}
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
