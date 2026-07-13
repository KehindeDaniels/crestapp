import type { Metadata } from "next";
import { KycReminderCard } from "@/features/kyc";

export const metadata: Metadata = { title: "Home" };

/**
 * Tightly-scoped placeholder — created only to give post-login/post-KYC
 * redirects a real landing target (unblocking a 404) and to host
 * KycReminderCard. This is NOT the real Home screen (Figma node 1411-2864:
 * property feed, search entry point, etc.) — that's Phase 3 scope, per
 * (client)/layout.tsx's own comment deferring the real AppShell to "the
 * property features." See docs/design-vs-backend-gaps.md (Phase 2.5).
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <KycReminderCard />
      {/* TODO(Phase 3): real Home screen — property feed, search entry point, per Figma node 1411-2864. */}
    </div>
  );
}
