"use client";

import { useMyKycStatus } from "../hooks";

/**
 * Persistent reminder shown on Home until KYC is approved. Renders nothing
 * while loading (avoids a flash-then-disappear on first paint) and once
 * approved. Any other status — or an outright query failure, where status
 * stays `undefined` — falls through to "show the reminder": the safe default,
 * since an unnecessary reminder is far lower-risk than hiding a needed one.
 *
 * Styling mirrors KycGuard's existing fallback CTA for visual consistency —
 * neither has a confirmed pixel-accurate Figma pull yet (the Home frame,
 * node 1411-2864, hasn't been inspected for a dedicated reminder-banner
 * design). See docs/design-vs-backend-gaps.md (Phase 2.5).
 *
 * TODO(Phase 3 AppShell): once the shared AppShell lands, this likely belongs
 * hoisted into its topbar/shell chrome rather than duplicated per-page.
 */
export function KycReminderCard() {
  const { data: status, isLoading } = useMyKycStatus();

  if (isLoading || status === "approved") return null;

  return (
    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      Verify your identity to unlock all features.{" "}
      <a href="/kyc" className="font-medium text-primary underline">
        Start KYC
      </a>
    </div>
  );
}
