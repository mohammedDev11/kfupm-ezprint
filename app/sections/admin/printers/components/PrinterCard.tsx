"use client";

import React from "react";
import { MoreHorizontal, Printer, SlidersHorizontal } from "lucide-react";
//import MainButton from "@/app/Mohammed/components/MainButton";
import Button from "@/app/components/ui/button/Button";
import { cn } from "@/app/components/lib/cn";
import type { PrinterItem, PrinterStatus } from "@/Data/Admin/printers";

type PrinterCardProps = {
  printer: PrinterItem;
  columns?: 2 | 3;
  onClick?: () => void;
  onConfigure?: (printer: PrinterItem) => void;
};

const statusClasses: Record<PrinterStatus, string> = {
  Online: "bg-success-100 text-success-600",
  Offline: "bg-danger-50 text-danger-500",
  "Low Toner": "bg-warning-50 text-warning-600",
  "Paper Jam": "bg-warning-50 text-warning-600",
};

const formatCompactNumber = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
};

const InfoStat = ({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) => {
  return (
    <div
      className="flex min-h-[88px] flex-col items-center justify-center rounded-2xl px-4 py-4 text-center"
      style={{ background: "var(--surface-2)" }}
    >
      <span className="text-2xl font-bold text-[var(--foreground)]">
        {value}
      </span>
      <span
        className="mt-1 text-xs font-semibold uppercase tracking-[0.16em]"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
    </div>
  );
};

const PrinterCard = ({
  printer,
  columns = 2,
  onClick,
  onConfigure,
}: PrinterCardProps) => {
  const compactCapabilities = columns === 3 ? 3 : 4;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "card rounded-[28px] p-7 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--surface-2)" }}
          >
            <Printer className="h-7 w-7 text-brand-500" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">
              {printer.name}
            </h3>
            <p className="mt-1 text-lg text-[var(--muted)]">
              {printer.location}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-4 py-2 text-base font-semibold",
            statusClasses[printer.status]
          )}
        >
          {printer.status}
        </span>

        {printer.capabilities
          .slice(0, compactCapabilities)
          .map((capability) => (
            <span
              key={capability}
              className="inline-flex items-center rounded-full border px-4 py-2 text-base font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--paragraph)",
              }}
            >
              {capability}
            </span>
          ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <InfoStat
          value={formatCompactNumber(printer.totalPagesPrinted)}
          label="Pages"
        />
        <InfoStat value={printer.totalJobsSubmitted} label="Jobs" />
        <InfoStat value={printer.costPerPage.toFixed(2)} label="SAR/PG" />
      </div>

      <div className="mt-6">
        {/*<MainButton
          label="Configure"
          icon={<SlidersHorizontal className="h-5 w-5" />}
          className="w-full rounded-md bg-brand-500"
          onClick={() => onConfigure?.(printer)}
        />
        */}
        {/* Replaced MainButton with the new Button component*/}
        <Button
          variant="primary"
          iconLeft={<SlidersHorizontal className="h-5 w-5" />}
          className="w-full"
          onClick={() => onConfigure?.(printer)}
        >
          Configure
        </Button>
      </div>
    </div>
  );
};

export default PrinterCard;
