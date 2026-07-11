"use client";

import type { ReactNode } from "react";
import { useSessionStore } from "@/features/auth";
import type { UserRole } from "@/config/constants";

/** Renders children only if the current user's role is in `allow`. UI-only — the API enforces the real permission. */
export function RoleGate({
  allow,
  children,
  fallback = null,
}: {
  allow: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const role = useSessionStore((s) => s.user?.role);
  if (!role || !allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
