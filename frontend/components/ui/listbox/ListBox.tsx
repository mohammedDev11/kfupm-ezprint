"use client";

import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type ListBoxOption = {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
};

type ListBoxProps = {
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
};

export default function ListBox({
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
}: ListBoxProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
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
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
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
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--muted)] transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
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
          <div className={cn("overflow-y-auto", maxHeightClassName)}>
            {normalizedOptions.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--surface-2)] disabled:pointer-events-none disabled:opacity-50",
                    isSelected ? "bg-[var(--surface-2)]" : "bg-transparent",
                    optionClassName,
                  )}
                  style={{
                    color: "var(--paragraph)",
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>

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
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
