import type { ReactNode } from "react";
import { AuthMarketingPanel } from "@/features/auth";

/**
 * Guest-only auth screens (login, register, password, verify). Split-screen
 * per Figma: fixed 708px navy marketing panel + centered form column.
 * The marketing panel is desktop-only (`lg:` breakpoint) — Figma has no
 * mobile frame for this screen, so that breakpoint choice is inferred.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AuthMarketingPanel />
      <div className="flex flex-1 items-start justify-center px-4 py-29.5">
        <div className="flex w-full max-w-94.75 flex-col gap-10">
          <img
            src="/images/auth/shared/logo-lockup.png"
            alt="Crest"
            className="h-14 w-45.5"
          />
          {children}
        </div>
      </div>
    </div>
  );
}
