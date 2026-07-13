"use client";

import type { ReactNode } from "react";
import type { KycStatus } from "@/config/constants";

/**
 * Blocks children unless KYC is approved; otherwise shows a "verify to continue"
 * CTA. `kycStatus` is passed in by the caller rather than fetched internally —
 * `useMyKycStatus()` now exists (features/kyc/hooks.ts, Phase 2.5); pass its
 * `.data` in as `kycStatus` once a real call site needs this guard. Left
 * prop-driven deliberately: this component has zero real call sites yet, so
 * refactoring it to fetch internally would be guessing at how future callers
 * (Phase 4+ contracts/transactions) want to compose it.
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
