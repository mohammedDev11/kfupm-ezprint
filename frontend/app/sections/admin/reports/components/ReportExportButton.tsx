"use client";

import { FileCode2, FileOutput, FileSpreadsheet } from "lucide-react";

import { cn } from "@/lib/cn";
import { TableExportFormat } from "@/lib/export";

type ReportExportButtonProps = {
  format: TableExportFormat;
  onClick?: () => void;
  className?: string;
};

const exportMeta: Record<
  TableExportFormat,
  { label: string; className: string; Icon: typeof FileOutput }
> = {
  PDF: {
    label: "PDF",
    className: "bg-red-500 text-white hover:bg-red-600",
    Icon: FileOutput,
  },
  Excel: {
    label: "Excel",
    className: "bg-emerald-500 text-white hover:bg-emerald-600",
    Icon: FileSpreadsheet,
  },
  CSV: {
    label: "CSV",
    className: "bg-brand-500 text-white hover:bg-brand-600",
    Icon: FileCode2,
  },
};

export default function ReportExportButton({
  format,
  onClick,
  className = "",
}: ReportExportButtonProps) {
  const meta = exportMeta[format];
  const Icon = meta.Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center overflow-hidden rounded-md p-2 shadow-sm transition-all duration-500 hover:scale-[1.03]",
        meta.className,
        className,
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center">
        <Icon size={20} />
      </div>

      <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-sm font-semibold transition-all duration-500 group-hover:max-w-[120px] group-hover:pr-3">
        {meta.label}
      </span>
    </button>
  );
}
