"use client";

import { getSession, type Scope } from "@/services/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const scopeAllowsRole = (scope: Scope, role: string) => {
  if (scope === "admin") {
    return role === "Admin" || role === "SubAdmin";
  }

  return role === "User" || role === "Admin" || role === "SubAdmin";
};

export default function RoleGuard({
  scope,
  children,
}: {
  scope: Scope;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession(scope);

    if (!session || !scopeAllowsRole(scope, session.user.role)) {
      router.replace("/");
      return;
    }

    let isActive = true;
    queueMicrotask(() => {
      if (isActive) {
        setReady(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, [router, scope]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
