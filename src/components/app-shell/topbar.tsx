"use client";

import Image from "next/image";
import { Bell, BadgeCheck, User } from "lucide-react";
import { useProfile } from "@/features/profile";
import { useMyKycStatus } from "@/features/kyc";
import { useHasUnreadNotifications } from "@/features/notifications";
import { MobileNav } from "./mobile-nav";

/**
 * Favorites (heart) icon is intentionally absent — hidden entirely per the
 * favorites decision (docs/design/home-page-data-plan.md §7), no endpoint
 * exists for it.
 */
export function Topbar() {
  const { data: profile } = useProfile();
  const { data: kycStatus } = useMyKycStatus();
  const { data: hasUnread } = useHasUnreadNotifications();
  const isVerified = kycStatus === "approved";

  return (
    <header className="sticky top-0 z-10 flex h-20.5 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 lg:px-10">
      <MobileNav />

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-muted sm:size-11"
          aria-label="Notifications"
        >
          <Bell className="size-5 text-foreground" />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive" />
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-muted sm:size-11.25">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <User className="absolute inset-0 m-auto size-5 text-muted-foreground" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">{profile?.displayName ?? "…"}</p>
            {isVerified && (
              <p className="flex items-center gap-1 text-xs text-success">
                <BadgeCheck className="size-3.5" />
                Verified
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
