import type { ReactNode } from "react";

/** Minimal chrome for onboarding flows (KYC wizard). Auth guard added in Phase 1/2. */
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="bg-background min-h-screen">{children}</div>;
}
