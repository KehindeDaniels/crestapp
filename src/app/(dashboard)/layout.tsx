import type { ReactNode } from "react";

/**
 * Authenticated app shell placeholder. Phase 1 wraps this with <AuthGuard> and the
 * real AppShell (sidebar + topbar + KYC banner). Kept minimal for the foundation.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <div className="bg-background min-h-screen">{children}</div>;
}
