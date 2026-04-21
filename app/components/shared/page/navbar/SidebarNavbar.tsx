// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { RiPrinterLine } from "react-icons/ri";
// import Image from "next/image";
// import favicon from "@/app/favicon.ico";
// import { cn } from "@/Data/Common/utils";
// import { sidebarSections } from "@/Data/Navbar";
// type SidebarNavbarProps = {
//   isExpanded: boolean;
//   onMouseEnter: () => void;
//   onMouseLeave: () => void;
// };

// export default function SidebarNavbar({
//   isExpanded,
//   onMouseEnter,
//   onMouseLeave,
// }: SidebarNavbarProps) {
//   const pathname = usePathname();

//   return (
//     <aside
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//       className={cn(
//         "fixed left-0 top-0 z-50 hidden h-screen lg:flex",
//         isExpanded ? "w-[272px]" : "w-[96px]",
//         "transition-[width] duration-300 ease-out"
//       )}
//     >
//       <div
//         className="flex h-full w-full flex-col border-r bg-[var(--surface)] px-3 py-4"
//         style={{ borderColor: "var(--border)" }}
//       >
//         <div className="flex h-full flex-col">
//           <div className="mb-4 flex min-h-[56px] items-center">
//             <Link
//               href="/"
//               className={cn(
//                 "flex w-full items-center rounded-md py-2",
//                 isExpanded ? "justify-start px-3" : "justify-center px-2"
//               )}
//             >
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md">
//                 <Image
//                   src={favicon}
//                   alt="EzPrint Logo"
//                   width={40}
//                   height={40}
//                   className="h-10 w-10 ml-2 object-contain"
//                   priority
//                 />
//               </div>

//               <span
//                 className={cn(
//                   "ml-3 overflow-hidden whitespace-nowrap text-lg font-semibold tracking-tight transition-all duration-200",
//                   isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
//                 )}
//               >
//                 EzPrint
//               </span>
//             </Link>
//           </div>

//           <div className="ezprint-sidebar-scroll flex min-h-0 -mt-4 flex-1 flex-col justify-between">
//             <div className="space-y-5">
//               {sidebarSections.map((section, sectionIndex) => (
//                 <div key={section.title}>
//                   <p
//                     className={cn(
//                       "text-muted mb-2 overflow-hidden whitespace-nowrap px-2 text-xs font-semibold tracking-[0.22em] uppercase transition-all duration-200",
//                       isExpanded
//                         ? "max-w-[180px] opacity-100"
//                         : "max-w-0 opacity-0"
//                     )}
//                   >
//                     {section.title}
//                   </p>

//                   <div className="space-y-1.5">
//                     {section.items.map((item) => {
//                       const Icon = item.icon;
//                       const active =
//                         pathname === item.href ||
//                         pathname.startsWith(`${item.href}/`);

//                       return (
//                         <Link
//                           key={item.href}
//                           href={item.href}
//                           className={cn(
//                             "flex h-12 items-center rounded-md transition pl-4",
//                             isExpanded
//                               ? "justify-start px-3"
//                               : "justify-center px-2",
//                             active
//                               ? // ? "bg-[var(--surface-2)] text-[var(--foreground)]"
//                                 "bg-brand-500 text-white"
//                               : "text-[var(--paragraph)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
//                           )}
//                         >
//                           <div className="flex h-10 w-10 shrink-0 items-center justify-center">
//                             <Icon
//                               className={cn(
//                                 "text-[1.5rem] transition",
//                                 // active ? "text-brand-500" : "text-brand-700"
//                                 active ? "text-white " : "text-muted"
//                               )}
//                             />
//                           </div>

//                           <span
//                             className={cn(
//                               "ml-3 overflow-hidden whitespace-nowrap text-[1.02rem] font-medium transition-all duration-200",
//                               isExpanded
//                                 ? "max-w-[170px] opacity-100"
//                                 : "max-w-0 opacity-0",
//                               active && "font-semibold"
//                             )}
//                           >
//                             {item.label}
//                           </span>
//                         </Link>
//                       );
//                     })}
//                   </div>

//                   {sectionIndex === 0 && (
//                     <div
//                       className="mt-3 h-px w-full"
//                       style={{ background: "var(--border)" }}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import favicon from "@/app/favicon.ico";
// import { cn } from "@/Data/Common/utils";
// import type { SidebarSection } from "@/Data/Navbar";

// type SidebarNavbarProps = {
//   sections: SidebarSection[];
//   isExpanded: boolean;
//   onMouseEnter: () => void;
//   onMouseLeave: () => void;
// };

// export default function SidebarNavbar({
//   sections,
//   isExpanded,
//   onMouseEnter,
//   onMouseLeave,
// }: SidebarNavbarProps) {
//   const pathname = usePathname();

//   return (
//     <aside
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//       className={cn(
//         "fixed left-0 top-0 z-50 hidden h-screen lg:flex",
//         isExpanded ? "w-[272px]" : "w-[96px]",
//         "transition-[width] duration-300 ease-out"
//       )}
//     >
//       <div
//         className="flex h-full w-full flex-col border-r bg-[var(--surface)] px-3 py-4"
//         style={{ borderColor: "var(--border)" }}
//       >
//         <div className="flex h-full flex-col">
//           <div className="mb-4 flex min-h-[56px] items-center">
//             <Link
//               href="/"
//               className={cn(
//                 "flex w-full items-center rounded-md py-2",
//                 isExpanded ? "justify-start px-3" : "justify-center px-2"
//               )}
//             >
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md">
//                 <div className="bg-brand-900 rounded-md p-1.5">
//                   <Image src={favicon} alt="logo" width={25} height={25} />
//                 </div>
//               </div>

//               <span
//                 className={cn(
//                   "ml-3 overflow-hidden whitespace-nowrap text-lg font-semibold tracking-tight transition-all duration-200",
//                   isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
//                 )}
//               >
//                 EzPrint
//               </span>
//             </Link>
//           </div>

//           <div className="ezprint-sidebar-scroll flex min-h-0 -mt-4 flex-1 flex-col justify-between">
//             <div className="space-y-5">
//               {sections.map((section, sectionIndex) => (
//                 <div key={section.title}>
//                   <p
//                     className={cn(
//                       "text-muted mb-2 overflow-hidden whitespace-nowrap px-2 text-xs font-semibold tracking-[0.22em] uppercase transition-all duration-200",
//                       isExpanded
//                         ? "max-w-[180px] opacity-100"
//                         : "max-w-0 opacity-0"
//                     )}
//                   >
//                     {section.title}
//                   </p>

//                   <div className="space-y-1.5">
//                     {section.items.map((item) => {
//                       const Icon = item.icon;
//                       const active =
//                         pathname === item.href ||
//                         pathname.startsWith(`${item.href}/`);

//                       return (
//                         <Link
//                           key={item.href}
//                           href={item.href}
//                           className={cn(
//                             "flex h-12 items-center rounded-md pl-4 transition",
//                             isExpanded
//                               ? "justify-start px-3"
//                               : "justify-center px-2",
//                             active
//                               ? "bg-brand-500 text-white"
//                               : "text-[var(--paragraph)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
//                           )}
//                         >
//                           <div className="flex h-10 w-10 shrink-0 items-center justify-center">
//                             <Icon
//                               className={cn(
//                                 "text-[1.5rem] transition",
//                                 active ? "text-white" : "text-muted"
//                               )}
//                             />
//                           </div>

//                           <span
//                             className={cn(
//                               "ml-3 overflow-hidden whitespace-nowrap text-[1.02rem] font-medium transition-all duration-200",
//                               isExpanded
//                                 ? "max-w-[170px] opacity-100"
//                                 : "max-w-0 opacity-0",
//                               active && "font-semibold"
//                             )}
//                           >
//                             {item.label}
//                           </span>
//                         </Link>
//                       );
//                     })}
//                   </div>

//                   {sectionIndex === 0 && (
//                     <div
//                       className="mt-3 h-px w-full"
//                       style={{ background: "var(--border)" }}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

//==========Correct===================
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import favicon from "@/app/favicon.ico";
// import { cn } from "@/Data/Common/utils";
// import type { SidebarSection } from "@/Data/Navbar";

// type SidebarNavbarProps = {
//   sections: SidebarSection[];
//   isExpanded: boolean;
//   onMouseEnter: () => void;
//   onMouseLeave: () => void;
// };

// export default function SidebarNavbar({
//   sections,
//   isExpanded,
//   onMouseEnter,
//   onMouseLeave,
// }: SidebarNavbarProps) {
//   const pathname = usePathname();

//   return (
//     <aside
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//       className={cn(
//         "fixed left-0 top-0 z-50 hidden h-screen lg:flex",
//         isExpanded ? "w-[272px]" : "w-[96px]",
//         "transition-[width] duration-300 ease-out"
//       )}
//     >
//       <div
//         className="flex h-full w-full flex-col border-r bg-[var(--surface)] px-3 py-4"
//         style={{ borderColor: "var(--border)" }}
//       >
//         <div className="flex h-full flex-col">
//           {/* ===== Logo ===== */}
//           <div className="mb-4 flex min-h-[56px] items-center">
//             <Link
//               href="/"
//               className={cn(
//                 "flex w-full items-center rounded-md py-2",
//                 isExpanded ? "justify-start px-3" : "justify-center px-2"
//               )}
//             >
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md">
//                 <div className="bg-brand-900 rounded-md p-1.5">
//                   <Image src={favicon} alt="logo" width={25} height={25} />
//                 </div>
//               </div>

//               <span
//                 className={cn(
//                   "ml-3 overflow-hidden whitespace-nowrap text-lg font-semibold tracking-tight transition-all duration-200",
//                   isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
//                 )}
//               >
//                 EzPrint
//               </span>
//             </Link>
//           </div>

//           {/* ===== Content ===== */}
//           <div className="ezprint-sidebar-scroll flex min-h-0 -mt-4 flex-1 flex-col justify-between">
//             <div className="space-y-5">
//               {sections.map((section, sectionIndex) => (
//                 <div key={section.title}>
//                   {/* Section Title */}
//                   <p
//                     className={cn(
//                       "text-muted mb-2 overflow-hidden whitespace-nowrap px-2 text-xs font-semibold tracking-[0.22em] uppercase transition-all duration-200",
//                       isExpanded
//                         ? "max-w-[180px] opacity-100"
//                         : "max-w-0 opacity-0"
//                     )}
//                   >
//                     {section.title}
//                   </p>

//                   {/* Items */}
//                   <div className="space-y-1.5">
//                     {section.items.map((item) => {
//                       const Icon = item.icon;

//                       // ✅ FIXED ACTIVE LOGIC
//                       const active =
//                         pathname === item.href ||
//                         (item.href !== "/" &&
//                           pathname.startsWith(`${item.href}/`));

//                       return (
//                         <Link
//                           key={item.href}
//                           href={item.href}
//                           className={cn(
//                             "flex h-12 items-center rounded-md pl-4 transition",
//                             isExpanded
//                               ? "justify-start px-3"
//                               : "justify-center px-2",
//                             active
//                               ? "bg-brand-500 text-white"
//                               : "text-[var(--paragraph)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
//                           )}
//                         >
//                           {/* Icon */}
//                           <div className="flex h-10 w-10 shrink-0 items-center justify-center">
//                             <Icon
//                               className={cn(
//                                 "text-[1.5rem] transition",
//                                 active ? "text-white" : "text-muted"
//                               )}
//                             />
//                           </div>

//                           {/* Label */}
//                           <span
//                             className={cn(
//                               "ml-3 overflow-hidden whitespace-nowrap text-[1.02rem] font-medium transition-all duration-200",
//                               isExpanded
//                                 ? "max-w-[170px] opacity-100"
//                                 : "max-w-0 opacity-0",
//                               active && "font-semibold"
//                             )}
//                           >
//                             {item.label}
//                           </span>
//                         </Link>
//                       );
//                     })}
//                   </div>

//                   {/* Divider */}
//                   {sectionIndex === 0 && (
//                     <div
//                       className="mt-3 h-px w-full"
//                       style={{ background: "var(--border)" }}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// //========New==============
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import favicon from "@/app/favicon.ico";
// import { cn } from "@/Data/Common/utils";
// import type { SidebarSection } from "@/Data/Navbar";

// type SidebarNavbarProps = {
//   sections: SidebarSection[];
//   isExpanded: boolean;
//   onMouseEnter: () => void;
//   onMouseLeave: () => void;
// };

// export default function SidebarNavbar({
//   sections,
//   isExpanded,
//   onMouseEnter,
//   onMouseLeave,
// }: SidebarNavbarProps) {
//   const pathname = usePathname();

//   return (
//     <aside
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//       className={cn(
//         "fixed left-0 top-0 z-50 hidden h-screen lg:flex",
//         isExpanded ? "w-[272px]" : "w-[96px]",
//         "transition-[width] duration-300 ease-out"
//       )}
//     >
//       <div
//         className="flex h-full w-full flex-col border-r bg-[var(--surface)] px-3 py-4"
//         style={{ borderColor: "var(--border)" }}
//       >
//         <div className="flex h-full flex-col">
//           <div className="mb-4 flex min-h-[56px] items-center">
//             <Link
//               href="/"
//               className={cn(
//                 "flex w-full items-center rounded-md py-2",
//                 isExpanded ? "justify-start px-3" : "justify-center px-2"
//               )}
//             >
//               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md">
//                 <div className="rounded-md bg-brand-900 p-1.5">
//                   <Image src={favicon} alt="EzPrint logo" width={25} height={25} />
//                 </div>
//               </div>

//               <span
//                 className={cn(
//                   "ml-3 overflow-hidden whitespace-nowrap text-lg font-semibold tracking-tight transition-all duration-200",
//                   isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
//                 )}
//               >
//                 EzPrint
//               </span>
//             </Link>
//           </div>

//           <div className="ezprint-sidebar-scroll flex min-h-0 -mt-4 flex-1 flex-col justify-between">
//             <div className="space-y-5">
//               {sections.map((section, sectionIndex) => (
//                 <div key={section.title}>
//                   <p
//                     className={cn(
//                       "text-muted mb-2 overflow-hidden whitespace-nowrap px-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-200",
//                       isExpanded
//                         ? "max-w-[180px] opacity-100"
//                         : "max-w-0 opacity-0"
//                     )}
//                   >
//                     {section.title}
//                   </p>

//                   <div className="space-y-1.5">
//                     {section.items.map((item) => {
//                       const Icon = item.icon;

//                       const active =
//                         pathname === item.href ||
//                         (item.href !== "/" &&
//                           pathname.startsWith(`${item.href}/`));

//                       return (
//                         <Link
//                           key={item.href}
//                           href={item.href}
//                           className={cn(
//                             "flex h-12 items-center rounded-md pl-4 transition",
//                             isExpanded
//                               ? "justify-start px-3"
//                               : "justify-center px-2",
//                             active
//                               ? "bg-brand-500 text-white"
//                               : "text-[var(--paragraph)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
//                           )}
//                         >
//                           <div className="flex h-10 w-10 shrink-0 items-center justify-center">
//                             <Icon
//                               className={cn(
//                                 "text-[1.5rem] transition",
//                                 active ? "text-white" : "text-muted"
//                               )}
//                             />
//                           </div>

//                           <span
//                             className={cn(
//                               "ml-3 overflow-hidden whitespace-nowrap text-[1.02rem] font-medium transition-all duration-200",
//                               isExpanded
//                                 ? "max-w-[170px] opacity-100"
//                                 : "max-w-0 opacity-0",
//                               active && "font-semibold"
//                             )}
//                           >
//                             {item.label}
//                           </span>
//                         </Link>
//                       );
//                     })}
//                   </div>

//                   {sectionIndex === 0 && (
//                     <div
//                       className="mt-3 h-px w-full"
//                       style={{ background: "var(--border)" }}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

//========New==============
//========New==============
//========New==============

//========New==this=is=working==========
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import favicon from "@/app/favicon.ico";
// import { cn } from "@/Data/Common/utils";
// import type { SidebarSection } from "@/Data/Navbar";

// type SidebarNavbarProps = {
//   sections: SidebarSection[];
//   isExpanded: boolean;
//   onMouseEnter: () => void;
//   onMouseLeave: () => void;
// };

// export default function SidebarNavbar({
//   sections,
//   isExpanded,
//   onMouseEnter,
//   onMouseLeave,
// }: SidebarNavbarProps) {
//   const pathname = usePathname();

//   return (
//     <aside
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//       className={cn(
//         "fixed left-0 top-0 z-50 hidden h-screen lg:flex",
//         isExpanded ? "w-[272px]" : "w-[96px]",
//         "transition-[width] duration-300 ease-out"
//       )}
//     >
//       <div
//         className="flex h-full w-full flex-col border-r bg-[var(--surface)] px-3 py-4"
//         style={{ borderColor: "var(--border)" }}
//       >
//         <div className="flex h-full flex-col">
//           <div className="mb-4 flex min-h-[56px] items-center">
//             <Link
//               href="/"
//               className={cn(
//                 "flex w-full items-center rounded-md py-2 justify-start px-3"
//                 // isExpanded ? "justify-start px-3" : "justify-center px-2"
//               )}
//             >
//               <div className="flex h-12 rounded-md bg-brand-900 w-11 shrink-0 items-center justify-center rounded-md">
//                 <Image
//                   src={favicon}
//                   alt="EzPrint logo"
//                   width={25}
//                   height={25}
//                 />
//               </div>

//               <span
//                 className={cn(
//                   "ml-3 overflow-hidden whitespace-nowrap text-lg font-semibold tracking-tight transition-all duration-200",
//                   isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
//                 )}
//               >
//                 Alpha Queue
//               </span>
//             </Link>
//           </div>

//           <div className="ezprint-sidebar-scroll flex min-h-0 -mt-4 flex-1 flex-col justify-between">
//             <div className="space-y-5">
//               {sections.map((section, sectionIndex) => (
//                 <div key={section.title}>
//                   <p
//                     className={cn(
//                       "text-muted mb-2 mt-4 overflow-hidden whitespace-nowrap px-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-200",
//                       isExpanded
//                         ? "max-w-[180px] opacity-100"
//                         : "max-w-0 opacity-0"
//                     )}
//                   >
//                     {section.title}
//                   </p>

//                   <div className="space-y-2">
//                     {section.items.map((item) => {
//                       const Icon = item.icon;

//                       const active =
//                         pathname === item.href ||
//                         (item.href !== "/" &&
//                           pathname.startsWith(`${item.href}/`));

//                       return (
//                         <Link
//                           key={item.href}
//                           href={item.href}
//                           className={cn(
//                             "group flex h-12  justify-start px-[13px] items-center rounded-md transition cursor-pointer",
//                             // isExpanded
//                             //   ? "justify-start px-3"
//                             //   : "justify-center px-2",
//                             // active
//                             //   ? "bg-brand-500 text-white"
//                             //   : "text-[var(--paragraph)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
//                             active
//                               ? ""
//                               : "text-[var(--paragraph)] hover:text-[var(--foreground)]"
//                           )}
//                         >
//                           <div
//                             className={cn(
//                               "flex  h-10 w-10 shrink-0 items-center justify-center",
//                               active ? "inverse-surface rounded-md" : ""
//                             )}
//                           >
//                             <Icon
//                               className={cn(
//                                 "text-[1.5rem] transition",
//                                 active ? "" : "text-muted"
//                               )}
//                             />
//                           </div>

//                           <span
//                             className={cn(
//                               "ml-3 overflow-hidden whitespace-nowrap text-[1.02rem] font-medium transition-all group-hover:ml-5 duration-200",
//                               isExpanded
//                                 ? "max-w-[170px] opacity-100"
//                                 : "max-w-0 opacity-0",
//                               active && "font-semibold"
//                             )}
//                           >
//                             {item.label}
//                           </span>
//                         </Link>
//                       );
//                     })}
//                   </div>

//                   {sectionIndex === 0 && (
//                     <div
//                       className="mt-3 h-px w-full"
//                       style={{ background: "var(--border)" }}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

//=============NEW================
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import favicon from "@/app/favicon.ico";
// import { cn } from "@/Data/Common/utils";
// import type { SidebarItem, SidebarSection } from "@/Data/Navbar";
// import PreviewVideo from "@/app/components/ui/video/PreviewVideo";
// import { createPortal } from "react-dom";
// import { useEffect, useLayoutEffect, useRef, useState } from "react";

// type SidebarNavbarProps = {
//   sections: SidebarSection[];
//   isExpanded: boolean;
//   onMouseEnter: () => void;
//   onMouseLeave: () => void;
// };

// type SidebarVideoPreviewProps = {
//   item: SidebarItem;
//   anchorRef: React.RefObject<HTMLAnchorElement | null>;
//   visible: boolean;
// };

// function SidebarVideoPreview({
//   item,
//   anchorRef,
//   visible,
// }: SidebarVideoPreviewProps) {
//   const [mounted, setMounted] = useState(false);
//   const [coords, setCoords] = useState({ top: 0, left: 0 });

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useLayoutEffect(() => {
//     if (!visible || !anchorRef.current) return;

//     const updatePosition = () => {
//       const rect = anchorRef.current?.getBoundingClientRect();
//       if (!rect) return;

//       setCoords({
//         top: rect.top + rect.height / 2,
//         left: rect.right + 14,
//       });
//     };

//     updatePosition();

//     window.addEventListener("resize", updatePosition);
//     window.addEventListener("scroll", updatePosition, true);

//     return () => {
//       window.removeEventListener("resize", updatePosition);
//       window.removeEventListener("scroll", updatePosition, true);
//     };
//   }, [visible, anchorRef]);

//   if (!mounted || !visible) return null;

//   return createPortal(
//     <div
//       className="pointer-events-none fixed z-[99999]"
//       style={{
//         top: coords.top,
//         left: coords.left,
//         transform: "translateY(-50%)",
//       }}
//     >
//       <div className="relative">
//         <div
//           className="w-[220px] overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-xl"
//           style={{
//             background: "color-mix(in srgb, var(--surface) 92%, transparent)",
//             borderColor: "var(--border)",
//             boxShadow:
//               "0 20px 50px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)",
//           }}
//         >
//           <div className="overflow-hidden rounded-xl border border-[var(--border)]">
//             <div className="aspect-[16/10] w-full">
//               <PreviewVideo
//                 src={item.video}
//                 className="h-full w-full object-cover"
//               />
//             </div>
//           </div>

//           <div className="mt-2 px-1">
//             <p
//               className="truncate text-sm font-semibold"
//               style={{ color: "var(--foreground)" }}
//             >
//               {item.label}
//             </p>
//             <p className="truncate text-xs" style={{ color: "var(--muted)" }}>
//               Live page preview
//             </p>
//           </div>
//         </div>

//         <span
//           className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border"
//           style={{
//             background: "color-mix(in srgb, var(--surface) 92%, transparent)",
//             borderColor: "var(--border)",
//           }}
//         />
//       </div>
//     </div>,
//     document.body
//   );
// }

// type SidebarNavItemProps = {
//   item: SidebarItem;
//   isExpanded: boolean;
//   pathname: string;
// };

// function SidebarNavItem({ item, isExpanded, pathname }: SidebarNavItemProps) {
//   const Icon = item.icon;
//   const linkRef = useRef<HTMLAnchorElement | null>(null);
//   const [hovered, setHovered] = useState(false);

//   const active =
//     pathname === item.href ||
//     (item.href !== "/" && pathname.startsWith(`${item.href}/`));

//   return (
//     <>
//       <Link
//         ref={linkRef}
//         href={item.href}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//         className={cn(
//           "group flex h-12 justify-start px-[13px] items-center rounded-md transition cursor-pointer",
//           active ? "" : "text-[var(--paragraph)] hover:text-[var(--foreground)]"
//         )}
//       >
//         <div
//           className={cn(
//             "flex h-10 w-10 shrink-0 items-center justify-center",
//             active ? "inverse-surface rounded-md" : ""
//           )}
//         >
//           <Icon
//             className={cn(
//               "text-[1.5rem] transition",
//               active ? "" : "text-muted"
//             )}
//           />
//         </div>

//         <span
//           className={cn(
//             "ml-3 overflow-hidden whitespace-nowrap text-[1.02rem] font-medium transition-all duration-200 group-hover:ml-5",
//             isExpanded ? "max-w-[170px] opacity-100" : "max-w-0 opacity-0",
//             active && "font-semibold"
//           )}
//         >
//           {item.label}
//         </span>
//       </Link>

//       {isExpanded && hovered && item.video && (
//         <SidebarVideoPreview
//           item={item}
//           anchorRef={linkRef}
//           visible={hovered}
//         />
//       )}
//     </>
//   );
// }

// export default function SidebarNavbar({
//   sections,
//   isExpanded,
//   onMouseEnter,
//   onMouseLeave,
// }: SidebarNavbarProps) {
//   const pathname = usePathname();

//   return (
//     <aside
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//       className={cn(
//         "fixed left-0 top-0 z-50 hidden h-screen lg:flex",
//         isExpanded ? "w-[272px]" : "w-[96px]",
//         "transition-[width] duration-300 ease-out"
//       )}
//     >
//       <div
//         className="flex h-full w-full flex-col border-r bg-[var(--surface)] px-3 py-4"
//         style={{ borderColor: "var(--border)" }}
//       >
//         <div className="flex h-full flex-col">
//           <div className="mb-4 flex min-h-[56px] items-center">
//             <Link
//               href="/"
//               className={cn(
//                 "flex w-full items-center rounded-md py-2 justify-start px-3"
//               )}
//             >
//               <div className="flex h-12 w-11 shrink-0 items-center justify-center rounded-md bg-brand-900">
//                 <Image
//                   src={favicon}
//                   alt="EzPrint logo"
//                   width={25}
//                   height={25}
//                 />
//               </div>

//               <span
//                 className={cn(
//                   "ml-3 overflow-hidden whitespace-nowrap text-lg font-semibold tracking-tight transition-all duration-200",
//                   isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
//                 )}
//               >
//                 Alpha Queue
//               </span>
//             </Link>
//           </div>

//           <div className="ezprint-sidebar-scroll flex min-h-0 -mt-4 flex-1 flex-col justify-between">
//             <div className="space-y-5">
//               {sections.map((section, sectionIndex) => (
//                 <div key={section.title}>
//                   <p
//                     className={cn(
//                       "text-muted mb-2 mt-4 overflow-hidden whitespace-nowrap px-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-200",
//                       isExpanded
//                         ? "max-w-[180px] opacity-100"
//                         : "max-w-0 opacity-0"
//                     )}
//                   >
//                     {section.title}
//                   </p>

//                   <div className="space-y-2">
//                     {section.items.map((item) => (
//                       <SidebarNavItem
//                         key={item.href}
//                         item={item}
//                         isExpanded={isExpanded}
//                         pathname={pathname}
//                       />
//                     ))}
//                   </div>

//                   {sectionIndex === 0 && (
//                     <div
//                       className="mt-3 h-px w-full"
//                       style={{ background: "var(--border)" }}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

// ===============NEW=================
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import favicon from "@/app/favicon.ico";
import { cn } from "@/Data/Common/utils";
import type { SidebarItem, SidebarSection } from "@/Data/Navbar";
import PreviewVideo from "@/app/components/ui/video/PreviewVideo";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type SidebarNavbarProps = {
  sections: SidebarSection[];
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

type SidebarVideoPreviewProps = {
  item: SidebarItem;
  anchorRef: React.RefObject<HTMLAnchorElement | null>;
  visible: boolean;
};

function SidebarVideoPreview({
  item,
  anchorRef,
  visible,
}: SidebarVideoPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 14,
      });
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible, anchorRef]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[99999]"
      style={{
        top: coords.top,
        left: coords.left,
        transform: "translateY(-50%)",
      }}
    >
      <div className="relative">
        <div
          className="w-[220px] overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-xl"
          style={{
            background: "color-mix(in srgb, var(--surface) 92%, transparent)",
            borderColor: "var(--border)",
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <div className="aspect-[16/10] w-full">
              <PreviewVideo
                lightVideoSrc={item.lightVideoSrc}
                darkVideoSrc={item.darkVideoSrc}
                className="h-full w-full"
              />
            </div>
          </div>

          <div className="mt-2 px-1">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {item.label}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--muted)" }}>
              Live page preview
            </p>
          </div>
        </div>

        <span
          className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border"
          style={{
            background: "color-mix(in srgb, var(--surface) 92%, transparent)",
            borderColor: "var(--border)",
          }}
        />
      </div>
    </div>,
    document.body
  );
}

type SidebarNavItemProps = {
  item: SidebarItem;
  isExpanded: boolean;
  pathname: string;
};

function SidebarNavItem({ item, isExpanded, pathname }: SidebarNavItemProps) {
  const Icon = item.icon;
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const active =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(`${item.href}/`));

  const hasPreviewVideo = item.lightVideoSrc || item.darkVideoSrc;

  return (
    <>
      <Link
        ref={linkRef}
        href={item.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "group flex h-12 items-center justify-start rounded-md px-[13px] transition cursor-pointer",
          active ? "" : "text-[var(--paragraph)] hover:text-[var(--foreground)]"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center",
            active ? "inverse-surface rounded-md" : ""
          )}
        >
          <Icon
            className={cn(
              "text-[1.5rem] transition",
              active ? "" : "text-muted"
            )}
          />
        </div>

        <span
          className={cn(
            "ml-3 overflow-hidden whitespace-nowrap text-[1.02rem] font-medium transition-all duration-200 group-hover:ml-5",
            isExpanded ? "max-w-[170px] opacity-100" : "max-w-0 opacity-0",
            active && "font-semibold"
          )}
        >
          {item.label}
        </span>
      </Link>

      {isExpanded && hovered && hasPreviewVideo && (
        <SidebarVideoPreview
          item={item}
          anchorRef={linkRef}
          visible={hovered}
        />
      )}
    </>
  );
}

export default function SidebarNavbar({
  sections,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
}: SidebarNavbarProps) {
  const pathname = usePathname();

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "fixed left-0 top-0 z-50 hidden h-screen lg:flex",
        isExpanded ? "w-[272px]" : "w-[96px]",
        "transition-[width] duration-300 ease-out"
      )}
    >
      <div
        className="flex h-full w-full flex-col border-r bg-[var(--surface)] px-3 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex h-full flex-col">
          <div className="mb-4 flex min-h-[56px] items-center">
            <Link
              href="/"
              className={cn(
                "flex w-full items-center justify-start rounded-md px-3 py-2"
              )}
            >
              <div className="flex h-12 w-11 shrink-0 items-center justify-center rounded-md bg-brand-900">
                <Image
                  src={favicon}
                  alt="EzPrint logo"
                  width={25}
                  height={25}
                />
              </div>

              <span
                className={cn(
                  "ml-3 overflow-hidden whitespace-nowrap text-lg font-semibold tracking-tight transition-all duration-200",
                  isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
                )}
              >
                Alpha Queue
              </span>
            </Link>
          </div>

          <div className="ezprint-sidebar-scroll flex min-h-0 -mt-4 flex-1 flex-col justify-between">
            <div className="space-y-5">
              {sections.map((section, sectionIndex) => (
                <div key={section.title}>
                  <p
                    className={cn(
                      "text-muted mb-2 mt-4 overflow-hidden whitespace-nowrap px-2 text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-200",
                      isExpanded
                        ? "max-w-[180px] opacity-100"
                        : "max-w-0 opacity-0"
                    )}
                  >
                    {section.title}
                  </p>

                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <SidebarNavItem
                        key={item.href}
                        item={item}
                        isExpanded={isExpanded}
                        pathname={pathname}
                      />
                    ))}
                  </div>

                  {sectionIndex === 0 && (
                    <div
                      className="mt-3 h-px w-full"
                      style={{ background: "var(--border)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
