// import NavbarShell from "@/app/components/shared/page/navbar/NavbarShell";
// import React from "react";

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return <NavbarShell>{children}</NavbarShell>;
// }

import React from "react";
import NavbarShell from "@/app/components/shared/page/navbar/NavbarShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <NavbarShell role="admin">{children}</NavbarShell>;
}
