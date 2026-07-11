"use client";

import type { ReactNode } from "react";
import type { VerificationStatus } from "@/config/constants";

/**
 * Blocks children unless a property's verification_status is "verified"
 * (e.g. before allowing activate/contract actions). Status is passed by the
 * caller — wired to real property data starting in Phase 4.
 */
export function VerifiedGate({
  verificationStatus,
  children,
  fallback,
}: {
  verificationStatus: VerificationStatus | undefined;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  if (verificationStatus === "verified") return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <p className="text-sm text-muted-foreground">
          This property must be verified before this action is available.
        </p>
      )}
    </>
  );
}
