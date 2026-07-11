import type { ReactNode } from "react";
import { AuthGuard } from "@/components/guards";

/**
 * Authenticated client-app shell placeholder (renter/buyer/agent/landlord area —
 * distinct from the separate admin Dashboard, which lives under /admin/* in
 * Phase 7). The real AppShell (sidebar + topbar + KYC banner) lands with the
 * property features — kept minimal here.
 */
export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="bg-background min-h-screen">{children}</div>
    </AuthGuard>
  );
}
