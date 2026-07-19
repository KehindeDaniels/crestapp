"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/features/auth";

/**
 * List Property's entry point — the "empty state" intro screen (real Figma
 * pull, node 1465:6445 in file `1jtfoprMGUFfoo3CBzhjMV`), missed entirely in
 * the first pass which jumped straight into the step-1 form. Reuses the
 * existing `list-property-illustration.png` asset (already downloaded for
 * Home's banner, same "list your property" concept) rather than pulling a
 * new one-off Figma illustration asset.
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
    <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-10">
      <div className="bg-muted/30 flex flex-col items-center gap-8 rounded-2xl border p-6 sm:flex-row sm:p-10">
        <div className="space-y-4 sm:flex-1">
          <h1 className="text-2xl font-bold sm:text-4xl">List your property</h1>
          <p className="text-muted-foreground text-base sm:text-xl">
            Connect directly with verified buyers and renters. Listings are
            reviewed before approval.
          </p>

          {canList ? (
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/properties/new/details">Get Started</Link>
            </Button>
          ) : (
            <div className="border-destructive/30 bg-destructive/5 space-y-3 rounded-xl border p-4">
              <p className="text-destructive text-sm font-medium">
                Only Landlord and Seller accounts can list properties.
              </p>
              <p className="text-muted-foreground text-sm">
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
          src="/images/home/list-property-illustration.png"
          alt=""
          width={420}
          height={200}
          className="w-full max-w-xs sm:max-w-sm"
        />
      </div>
    </div>
  );
}
