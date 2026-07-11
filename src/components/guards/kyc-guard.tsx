"use client";

import type { ReactNode } from "react";
import type { KycStatus } from "@/config/constants";

/**
 * Blocks children unless KYC is approved; otherwise shows a "verify to continue"
 * CTA. `kycStatus` is passed in by the caller — the actual KYC status query is
 * built in Phase 2 (features/kyc); this guard is the reusable shell for it.
 */
export function KycGuard({
  kycStatus,
  children,
  fallback,
}: {
  kycStatus: KycStatus | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  if (kycStatus === "approved") return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Verify your identity to continue.{" "}
          <a href="/kyc" className="font-medium text-primary underline">
            Start KYC
          </a>
        </div>
      )}
    </>
  );
}
