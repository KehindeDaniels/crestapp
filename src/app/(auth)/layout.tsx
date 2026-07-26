import type { ReactNode } from "react";
import Image from "next/image";
import { AuthMarketingPanel } from "@/features/auth";
import { GuestGuard } from "@/components/guards";

/**
 * Guest-only auth screens (login, register, password, verify). Split-screen
 * per Figma: responsive navy marketing panel (fluid up to 708px, matching
 * the 1440px desktop frame) + centered form column.
 * The marketing panel is desktop-only (`lg:` breakpoint) — Figma has no
 * mobile frame for this screen, so that breakpoint choice is inferred.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen lg:h-screen lg:overflow-hidden">
        <AuthMarketingPanel />
        <div className="flex flex-1 items-start justify-center px-4 py-10 sm:px-8 lg:h-full lg:overflow-y-auto lg:px-12 lg:py-16 xl:py-29.5">
          <div className="flex w-full max-w-94.75 flex-col gap-10">
            <Image
              src="/images/auth/shared/logo-lockup.png"
              alt="Crest"
              width={183}
              height={56}
              className="h-14 w-45.5"
            />
            {children}
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
