"use client";

import React from "react";
import { cn } from "@/lib/cn";

type IconLabelButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  labelClassName?: string;
};

export default function IconLabelButton({
  icon,
  label,
  onClick,
  className,
  labelClassName,
}: IconLabelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center rounded-xl px-2 py-2 text-sm font-medium transition cursor-pointer",
        className
      )}
    >
      {/* ICON */}
      <span className="flex h-8 w-8 items-center justify-center shrink-0">
        {icon}
      </span>

      {/* LABEL */}
      <span
        className={cn(
          "ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0",
          "transition-all duration-700",
          "group-hover:ml-0.5 group-hover:max-w-[120px] group-hover:opacity-100",
          labelClassName
        )}
      >
        {label}
      </span>
    </button>
  );
}
