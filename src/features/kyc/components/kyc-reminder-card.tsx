"use client";

import Link from "next/link";
import Image from "next/image";
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
 * Desktop styling matches the desktop Home Figma pull (compact circular
 * icon, right-aligned outline button). Mobile is a genuinely different
 * layout confirmed against a real Figma mobile pull (node 570:1225): a
 * large 92px illustrated shield-tick asset (not the small lucide icon)
 * and a full-width solid navy button, not an outline one.
 */
export function KycReminderCard() {
  const { data: status, isLoading } = useMyKycStatus();

  if (isLoading || status === "approved") return null;

  return (
    <>
      {/* Mobile */}
      <div className="rounded-xl border border-[rgba(31,79,216,0.12)] bg-[#f8f8f8] p-3 sm:hidden">
        <div className="flex items-center gap-2 pl-1">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-foreground">Complete your KYC</p>
            <p className="text-xs text-muted-foreground">
              This helps keep Crest safe and ensures you&apos;re connecting with
              real people and real properties.
            </p>
          </div>
          <Image
            src="/images/home/kyc-shield-tick.svg"
            alt=""
            width={92}
            height={92}
            className="shrink-0"
          />
        </div>
        <Button asChild size="xl" className="mt-3 w-full">
          <Link href="/kyc">Get Started</Link>
        </Button>
      </div>

      {/* Desktop */}
      <div className="hidden items-center justify-between gap-3 rounded-2xl bg-muted p-4 sm:flex">
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
        <Button asChild variant="outline" size="sm" className="w-auto shrink-0 bg-background">
          <Link href="/kyc">Get Started</Link>
        </Button>
      </div>
    </>
  );
}
