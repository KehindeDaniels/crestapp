import type { ReactNode } from "react";
import { AuthGuard } from "@/components/guards";
import { AppShell } from "@/components/app-shell";

/**
 * Authenticated client-app shell (renter/buyer/agent/landlord area — distinct
 * from the separate admin Dashboard, which lives under /admin/* in Phase 7).
 * Real AppShell (sidebar + topbar) landed with the property features, Phase 4.
 */
export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
