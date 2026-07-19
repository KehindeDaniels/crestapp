"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/features/auth";

/**
 * List Property's entry point — the "empty state" intro screen (real Figma
 * pull, node 1465:6445 in file `1jtfoprMGUFfoo3CBzhjMV`), missed entirely in
 * the first pass which jumped straight into the step-1 form.
 *
 * Rebuilt to match the pull exactly: the card fills the full content width
 * (no extra outer max-width shrinking it into a "banner") — same
 * light-gray panel, 42px heading, 24px paragraph, and full-height
 * illustration on the right. Uses the real exported `property-listing.svg`
 * asset (already includes the background blob), not the reused PNG from
 * an earlier pass.
 *
 * Gated by role: only `landlord`/`seller` accounts can create a listing at
 * all (confirmed live — a `landlord` account got a 403 trying to list a
 * Sale property; the backend's real seeded data shows Sale-property owners
 * have role `seller`, not `landlord`). Every other role sees a blocking
 * message instead of "Get Started" — see docs/design-vs-backend-gaps.md.
 */
export default function ListPropertyIntroPage() {
  const role = useSessionStore((s) => s.user?.role);
  const canList = role === "landlord" || role === "seller";

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="flex min-h-[520px] flex-col items-center justify-between gap-10 rounded-3xl border border-[rgba(102,102,102,0.16)] bg-[#f9fafb] p-8 sm:flex-row sm:gap-8 lg:p-16">
        <div className="max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl leading-tight font-bold text-foreground sm:text-[42px] sm:leading-[50px]">
              List your property
            </h1>
            <p className="text-lg text-foreground sm:text-2xl sm:leading-9">
              Connect directly with verified buyers and renters. Listings are
              reviewed before approval.
            </p>
          </div>

          {canList ? (
            <Button asChild size="xl" className="w-full sm:w-95">
              <Link href="/properties/new/details">Get Started</Link>
            </Button>
          ) : (
            <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">
                Only Landlord and Seller accounts can list properties.
              </p>
              <p className="text-sm text-muted-foreground">
                Your account is registered as {role ?? "unknown"}. There&apos;s
                no self-service way to change this yet — contact support if you
                need your account updated.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/home">Back to Home</Link>
              </Button>
            </div>
          )}
        </div>

        <Image
          src="/property-listing.svg"
          alt=""
          width={467}
          height={452}
          className="w-full max-w-xs shrink-0 sm:max-w-md"
        />
      </div>
    </div>
  );
}
