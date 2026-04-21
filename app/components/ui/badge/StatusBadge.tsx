// import React from "react";
// import { cn } from "@/app/components/lib/cn";

// export type StatusTone = "success" | "warning" | "danger" | "inactive";

// type StatusBadgeProps = {
//   label: string;
//   tone: StatusTone;
//   icon?: React.ReactNode;
//   className?: string;
// };

// const toneClasses: Record<StatusTone, string> = {
//   success: "bg-success-100 text-success-600",
//   warning: "bg-warning-50 text-warning-600",
//   danger: "bg-danger-50 text-danger-500",
//   inactive: "bg-inactive-900 text-inactive-100",
// };

// const StatusBadge = ({
//   label,
//   tone,
//   icon,
//   className = "",
// }: StatusBadgeProps) => {
//   return (
//     <span
//       className={cn(
//         "inline-flex items-center gap-3 rounded-full px-5 py-3 text-base font-semibold",
//         toneClasses[tone],
//         className
//       )}
//     >
//       {icon ? (
//         // <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-current">
//         <span>{icon}</span>
//       ) : null}

//       <span>{label}</span>
//     </span>
//   );
// };

// export default StatusBadge;

// ======New==========
import React from "react";
import { cn } from "@/app/components/lib/cn";

export type StatusTone = "success" | "warning" | "danger" | "inactive";

type StatusBadgeProps = {
  label?: string; // ✅ now optional
  tone: StatusTone;
  icon?: React.ReactNode;
  className?: string;
};

const toneClasses: Record<StatusTone, string> = {
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-500",
  inactive: "bg-inactive-900 text-inactive-100",
};

const StatusBadge = ({
  label,
  tone,
  icon,
  className = "",
}: StatusBadgeProps) => {
  const isIconOnly = !!icon && !label;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold",
        isIconOnly
          ? "px-4 py-2" // ✅ smaller padding for icon-only
          : "gap-3 px-5 py-3 text-base",
        toneClasses[tone],
        className
      )}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}

      {label && <span>{label}</span>}
    </span>
  );
};

export default StatusBadge;
