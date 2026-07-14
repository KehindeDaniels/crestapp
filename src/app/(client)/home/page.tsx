import type { Metadata } from "next";
import { KycReminderCard } from "@/features/kyc";

export const metadata: Metadata = { title: "Home" };

/**
 * Simple placeholder, not a mockup of the real Home screen (Figma reference:
 * docs/design/screenshots/home/ — a full sidebar + property search + listing
 * feed). Deliberately not built to match that reference: only two features
 * (auth, KYC) exist right now, and a fake sidebar/search/listing feed with
 * no real data behind it would misrepresent progress and create UI that has
 * to be un-built once the real property features land in Phase 3. This is
 * just enough to give post-login/post-KYC redirects a real landing target
 * and host KycReminderCard.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Property search, listings, and messaging are coming soon.
        </p>
      </div>
      <KycReminderCard />
    </div>
  );
}
