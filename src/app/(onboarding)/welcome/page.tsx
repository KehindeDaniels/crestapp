"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyKycStatus } from "@/features/kyc";

/**
 * Post-login "After Account Creation" screen — shown once, right after the
 * user's first successful login following registration (see
 * login-form.tsx's sessionStorage "crest:just-registered" check; nothing
 * blocks revisiting this URL directly later, it's just informational).
 *
 * Approximated from a user-provided screenshot
 * (docs/design/screenshots/after account creation.png), not a Figma node
 * pull — no node ID was available for it. Colors/spacing are inferred from
 * the existing design system (--primary navy, --success green) rather than
 * exact hex values off the screenshot. The original design's "What describes
 * you best?" role picker was relocated to /register/role (see
 * docs/design-vs-backend-gaps.md) since there's no backend endpoint to set
 * role after login — so it's intentionally absent here.
 */
export default function WelcomePage() {
  const router = useRouter();
  const { data: kycStatus, isLoading: kycLoading } = useMyKycStatus();
  const kycDone = kycStatus === "approved";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div className="flex items-center gap-4 rounded-2xl bg-primary p-6 text-primary-foreground">
        <div className="flex-1">
          <p className="text-lg font-semibold">Congratulations</p>
          <p className="text-lg font-semibold">Account Created successfully</p>
          <p className="mt-1 text-sm text-primary-foreground/70">Welcome to Crest</p>
        </div>
        <BadgeCheck className="size-12 shrink-0" />
      </div>

      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="size-2 rounded-full bg-primary" />
          Onboarding Process
        </p>

        <div className="divide-y overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between p-4">
            <p className="font-semibold">Account Creation</p>
            <CheckCircle2 className="size-6 text-success" />
          </div>
          <div className="flex items-center justify-between p-4">
            <p className="font-semibold">KYC Verification</p>
            {kycLoading ? null : kycDone ? (
              <span className="text-sm text-muted-foreground">Completed</span>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/kyc")}
                className="flex items-center gap-1 text-sm font-medium text-primary"
              >
                Go now
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Button className="w-full" onClick={() => router.push("/home")}>
        Continue
      </Button>
    </div>
  );
}
