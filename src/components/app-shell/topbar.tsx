"use client";

import Image from "next/image";
import { Bell, BadgeCheck, User } from "lucide-react";
import { useProfile } from "@/features/profile";
import { useMyKycStatus } from "@/features/kyc";
import { useUnreadNotifications } from "@/features/notifications";
import { MobileNav } from "./mobile-nav";

/**
 * Bell/avatar hidden below `sm` — Home renders its own complete header
 * (avatar/name/verified/tagline/icons) matching a real mobile Figma pull
 * (node 570:1225), so duplicating them here would be redundant on that
 * page. Search Property/Listing Detail have no confirmed mobile design yet
 * and lose this visibility on mobile as a result — an accepted, flagged
 * simplification, not an oversight; nothing breaks, the hamburger still
 * gives full nav access.
 */
export function Topbar() {
  const { data: profile } = useProfile();
  const { data: kycStatus } = useMyKycStatus();
  const { data: notifications } = useUnreadNotifications();
  const isVerified = kycStatus === "approved";

  return (
    <header className="sticky top-0 z-10 flex h-20.5 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 lg:px-10">
      <MobileNav />

      <div className="ml-auto hidden items-center gap-3 sm:flex sm:gap-4">
        <button
          type="button"
          className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-muted"
          aria-label="Notifications"
        >
          <Bell className="size-5 text-foreground" />
          {notifications?.hasUnread && (
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-destructive" />
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="relative size-11.25 shrink-0 overflow-hidden rounded-full bg-muted">
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
          <div>
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
