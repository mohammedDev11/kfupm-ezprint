// "use client";

// // import { cn } from "@/app/Mohammed/lib/cn";
// import { useEffect, useRef, useState } from "react";
// import AppNavbar from "./AppNavbar";
// import type { NavbarMode } from "./NavbarModeSwitcher";
// import { cn } from "@/Data/Common/utils";

// const STORAGE_KEY = "ezprint-navbar-mode";

// export default function NavbarShell({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [mode, setMode] = useState<NavbarMode>("left");
//   const [mounted, setMounted] = useState(false);
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
//   const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const saved = window.localStorage.getItem(STORAGE_KEY) as NavbarMode | null;

//     if (saved === "left" || saved === "bottom" || saved === "top") {
//       setMode(saved);
//     }

//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (!mounted) return;
//     window.localStorage.setItem(STORAGE_KEY, mode);
//   }, [mode, mounted]);

//   const handleSidebarMouseEnter = () => {
//     if (closeTimeoutRef.current) {
//       clearTimeout(closeTimeoutRef.current);
//     }
//     setIsSidebarExpanded(true);
//   };

//   const handleSidebarMouseLeave = () => {
//     closeTimeoutRef.current = setTimeout(() => {
//       setIsSidebarExpanded(false);
//     }, 180);
//   };

//   useEffect(() => {
//     return () => {
//       if (closeTimeoutRef.current) {
//         clearTimeout(closeTimeoutRef.current);
//       }
//     };
//   }, []);

//   if (!mounted) {
//     return <div className="min-h-screen">{children}</div>;
//   }

//   return (
//     <div className="min-h-screen">
//       <AppNavbar
//         mode={mode}
//         onModeChange={setMode}
//         isSidebarExpanded={isSidebarExpanded}
//         onSidebarMouseEnter={handleSidebarMouseEnter}
//         onSidebarMouseLeave={handleSidebarMouseLeave}
//       />

//       <main
//         className={cn(
//           "min-h-screen p-4 transition-all duration-300 sm:p-6",
//           mode === "left" &&
//             (isSidebarExpanded ? "lg:pl-[296px]" : "lg:pl-[120px]"),
//           mode === "top" && "pt-[108px]",
//           mode === "bottom" && "pb-[108px]"
//         )}
//       >
//         {children}
//       </main>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AppNavbar from "./AppNavbar";
import type { NavbarMode } from "./NavbarModeSwitcher";
import { cn } from "@/Data/Common/utils";
import { sidebarSectionsByRole, type NavbarRole } from "@/Data/Navbar";

const STORAGE_KEY = "ezprint-navbar-mode";

export default function NavbarShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: NavbarRole;
}) {
  const [mode, setMode] = useState<NavbarMode>("left");
  const [mounted, setMounted] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sections = useMemo(() => sidebarSectionsByRole[role], [role]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as NavbarMode | null;

    if (saved === "left" || saved === "bottom" || saved === "top") {
      setMode(saved);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode, mounted]);

  const handleSidebarMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsSidebarExpanded(true);
  };

  const handleSidebarMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsSidebarExpanded(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <AppNavbar
        mode={mode}
        onModeChange={setMode}
        isSidebarExpanded={isSidebarExpanded}
        onSidebarMouseEnter={handleSidebarMouseEnter}
        onSidebarMouseLeave={handleSidebarMouseLeave}
        sections={sections}
      />

      <main
        className={cn(
          "min-h-screen p-4 transition-all duration-300 sm:p-6",
          "pt-[92px] md:pt-6",
          mode === "left" &&
            (isSidebarExpanded ? "lg:pl-[296px]" : "lg:pl-[120px]"),
          mode === "top" && "md:pt-[108px]",
          mode === "bottom" && "md:pb-[108px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
