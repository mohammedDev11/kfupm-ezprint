"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type DropdownContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue?: string;
  selectedLabel?: React.ReactNode;
  onSelect: (value: string, label?: React.ReactNode) => void;
  fullWidth: boolean;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used inside <Dropdown />");
  }
  return context;
};

type DropdownProps = {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
};

export function Dropdown({
  children,
  value,
  defaultValue,
  onValueChange,
  className = "",
  fullWidth = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [selectedLabel, setSelectedLabel] = useState<React.ReactNode>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValue = value !== undefined ? value : internalValue;

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

  const onSelect = (nextValue: string, label?: React.ReactNode) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    setSelectedLabel(label ?? null);
    onValueChange?.(nextValue);
    setOpen(false);
  };

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      selectedValue,
      selectedLabel,
      onSelect,
      fullWidth,
    }),
    [open, selectedValue, selectedLabel, fullWidth]
  );

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`relative ${
          fullWidth ? "block w-full" : "inline-block"
        } ${className}`}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

type DropdownTriggerProps = {
  children?: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
  showChevron?: boolean;
};

export function DropdownTrigger({
  children,
  placeholder = "Select",
  className = "",
  showChevron = true,
}: DropdownTriggerProps) {
  const { open, setOpen, selectedLabel, fullWidth } = useDropdown();

  return (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className={`flex items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-left transition ${
        fullWidth ? "w-full" : "w-auto"
      } ${className}`}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--foreground)",
      }}
    >
      <div className="min-w-0 flex-1 truncate text-left">
        {children ?? selectedLabel ?? placeholder}
      </div>

      {showChevron && (
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: "var(--muted)" }}
        />
      )}
    </button>
  );
}

type DropdownContentProps = {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
  widthClassName?: string;
};

export function DropdownContent({
  children,
  className = "",
  align = "left",
  widthClassName,
}: DropdownContentProps) {
  const { open, fullWidth } = useDropdown();

  const resolvedWidthClassName =
    widthClassName ?? (fullWidth ? "w-full" : "w-56");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={`absolute top-[calc(100%+10px)] z-50 rounded-md border p-2 shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          } ${resolvedWidthClassName} ${className}`}
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "0 14px 40px rgba(var(--shadow-color), 0.16)",
          }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className="flex flex-col gap-1"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DropdownItemProps = {
  value: string;
  children: React.ReactNode;
  className?: string;
};

export function DropdownItem({
  value,
  children,
  className = "",
}: DropdownItemProps) {
  const { selectedValue, onSelect } = useDropdown();
  const isSelected = selectedValue === value;

  return (
    <motion.button
      type="button"
      variants={{
        hidden: { opacity: 0, x: -14 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onSelect(value, children)}
      className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition ${className}`}
      style={{
        background: isSelected ? "var(--surface-2)" : "transparent",
        color: "var(--paragraph)",
      }}
    >
      <div className="min-w-0 flex-1">{children}</div>

      <span className="ml-3 shrink-0">
        {isSelected && (
          <Check
            className="h-4 w-4"
            style={{ color: "var(--color-brand-500)" }}
          />
        )}
      </span>
    </motion.button>
  );
}
