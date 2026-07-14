"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useMyKycStatus } from "@/features/kyc";

/**
 * Blocks re-entry into the KYC wizard once a submission already exists.
 * Confirmed via a live 422 ("You already have a pending KYC submission")
 * AND via the Postman collection: `POST /api/admin/kyc/{id}/request-resubmission`
 * exists as a distinct ADMIN action, meaning resubmission is meant to be
 * admin-mediated, not freely user-triggered. Without this gate, a user could
 * burn time re-uploading three files just to hit that error at the final
 * submit step — this gate catches it up front instead.
 *
 * "rejected" is treated as allowed-to-resubmit (a reasonable default for any
 * KYC flow), but this is NOT explicitly confirmed — the collection also has
 * a separate "Reject KYC" admin action distinct from "Request Resubmission",
 * so it's possible rejection alone doesn't reopen submission either. Revisit
 * if a live test shows otherwise. See docs/design-vs-backend-gaps.md (Phase 2.5).
 */
export default function KycLayout({ children }: { children: ReactNode }) {
  const { data: status, isLoading } = useMyKycStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "approved") {
    return (
      <StatusScreen
        title="You're already verified"
        body="Your identity has already been confirmed — no further action needed."
      />
    );
  }

  if (status === "pending" || status === "under_review") {
    return (
      <StatusScreen
        title="Verification in progress"
        body="Your KYC submission is currently being reviewed. This typically takes 24 hours — you'll be notified by email or phone once it's complete."
      />
    );
  }

  return <>{children}</>;
}

function StatusScreen({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      <Link
        href="/home"
        className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Back to Home
      </Link>
    </div>
  );
}
