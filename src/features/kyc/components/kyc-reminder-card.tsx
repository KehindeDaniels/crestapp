"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyKycStatus } from "../hooks";

/**
 * Persistent reminder shown on Home until KYC is approved. Renders nothing
 * while loading (avoids a flash-then-disappear on first paint) and once
 * approved. Any other status — or an outright query failure, where status
 * stays `undefined` — falls through to "show the reminder": the safe default,
 * since an unnecessary reminder is far lower-risk than hiding a needed one.
 *
 * Styling matches the real "Complete your KYC" banner from the Home Figma
 * pull (docs/design/screenshots/home/) — a shield-check icon, heading, body
 * copy, and a right-aligned "Get Started" button on a muted panel.
 */
export function KycReminderCard() {
  const { data: status, isLoading } = useMyKycStatus();

  if (isLoading || status === "approved") return null;

  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent">
          <ShieldCheck className="size-5 text-primary" />
        </span>
        <div>
          <p className="text-sm font-semibold">Complete your KYC</p>
          <p className="text-sm text-muted-foreground">
            This helps keep Crest safe and ensures you&apos;re connecting
            with real people and real properties.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="w-full shrink-0 bg-background sm:w-auto">
        <Link href="/kyc">Get Started</Link>
      </Button>
    </div>
  );
}
