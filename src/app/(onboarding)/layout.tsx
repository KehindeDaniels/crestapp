import type { ReactNode } from "react";
import { AuthGuard } from "@/components/guards";

/** Minimal chrome for onboarding flows (KYC wizard). Authed — status=pending is fine. */
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="bg-background min-h-screen">{children}</div>
    </AuthGuard>
  );
}
