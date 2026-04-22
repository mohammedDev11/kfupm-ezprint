"use client";

import React from "react";
import {
  HiOutlineCodeBracket,
  HiOutlineDocumentArrowDown,
} from "react-icons/hi2";
import { PiMicrosoftExcelLogoLight } from "react-icons/pi";
import type { IconType } from "react-icons";
import { cn } from "@/lib/cn";
import type { ReportExportFormat } from "@/lib/mock-data/Admin/reports";

type ReportExportButtonProps = {
  format: ReportExportFormat;
  onClick?: () => void;
  className?: string;
};

const exportMeta: Record<
  ReportExportFormat,
  { label: string; icon: IconType; className: string }
> = {
  pdf: {
    label: "PDF",
    icon: HiOutlineDocumentArrowDown,
    className: "bg-red-500 text-white hover:bg-red-600",
  },
  html: {
    label: "HTML",
    icon: HiOutlineCodeBracket,
    className: "bg-brand-500 text-white hover:bg-brand-600",
  },
  excel: {
    label: "Excel",
    icon: PiMicrosoftExcelLogoLight,
    className: "bg-emerald-500 text-white hover:bg-emerald-600",
  },
};

const ReportExportButton = ({
  format,
  onClick,
  className = "",
}: ReportExportButtonProps) => {
  const meta = exportMeta[format];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center overflow-hidden rounded-md transition-all duration-500 hover:scale-[1.03] p-2 shadow-sm",
        meta.className,
        className
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center">
        <Icon size={22} />
      </div>

      <span
        className="
          max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold
          transition-all duration-500
          group-hover:max-w-[120px]
          group-hover:pr-3
        "
      >
        {meta.label}
      </span>
    </button>
  );
};

export default ReportExportButton;
