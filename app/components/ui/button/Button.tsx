// import clsx from "clsx";
// import { ReactNode, ButtonHTMLAttributes } from "react";

// type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
//   children: ReactNode;
//   variant?: "primary" | "secondary" | "ghost" | "outline";
//   size?: "sm" | "md" | "lg";
//   iconLeft?: ReactNode;
//   iconRight?: ReactNode;
// };

// export default function Button({
//   children,
//   variant = "primary",
//   size = "md",
//   iconLeft,
//   iconRight,
//   className,
//   type = "button",
//   ...props
// }: ButtonProps) {
//   return (
//     <button
//       type={type}
//       className={clsx(
//         "inline-flex items-center justify-center gap-2 rounded-md font-medium transition",

//         // Variant styles depending on the need
//         {
//           "bg-brand-500 text-white hover:bg-brand-600":
//             variant === "primary",
//           "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)]":
//             variant === "outline",
//           "border border-brand-500 bg-transparent text-brand-500 hover:bg-brand-500/10":
//             variant === "secondary",
//           "bg-transparent text-slate-300 hover:bg-white/5":
//             variant === "ghost",
//         },

//         // Sizes (padding and font size) depending on the need
//         {
//           "px-3 py-1.5 text-sm": size === "sm",
//           "px-4 py-2.5 text-sm": size === "md",
//           "px-5 py-3 text-base": size === "lg",
//         },

//         className
//       )}
//       {...props}
//     >
//       {iconLeft}
//       {children}
//       {iconRight}
//     </button>
//   );
// }

import clsx from "clsx";
import { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 cursor-pointer",

        // 🔵 PRIMARY (new design)
        {
          "relative overflow-hidden text-white rounded-md shadow-md":
            variant === "primary",
        },

        // darker gradient + darker hover
        {
          "bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] hover:from-[#1e40af] hover:to-[#1e3a8a] active:scale-[0.97]":
            variant === "primary",
        },

        // remove white glow → replace with darker feel
        {
          "hover:shadow-md hover:shadow-blue-900/40": variant === "primary",
        },
        // OTHER VARIANTS (unchanged)
        {
          "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)]":
            variant === "outline",
          "border border-[var(--border)] bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface)] text-[var(--foreground)] shadow-sm hover:from-[var(--surface)] hover:to-[var(--surface-2)] hover:border-[var(--color-brand-400)]":
            variant === "secondary",
          "bg-transparent text-slate-300 hover:bg-white/5": variant === "ghost",
        },

        // Sizes
        {
          "px-3 py-1.5 text-sm rounded-md": size === "sm",
          "px-5 py-2.5 text-base rounded-md": size === "md",
          "px-6 py-3 text-lg rounded-md": size === "lg",
        },

        className
      )}
      {...props}
    >
      {iconLeft}
      <span className="relative z-10">{children}</span>
      {iconRight}
    </button>
  );
}
