"use client";

import Image from "next/image";
import { Bell, BadgeCheck, Heart, MessageCircle, User } from "lucide-react";
import { useProfile } from "@/features/profile";
import { useMyKycStatus } from "@/features/kyc";
import { useUnreadNotifications } from "@/features/notifications";

/**
 * Mobile-only (`sm:hidden`) — matches a real Figma mobile pull (node
 * 570:1225) exactly, not inferred from a screenshot. Desktop keeps the
 * simpler "Welcome back" heading + `Topbar`'s own avatar/bell instead;
 * this duplicates that data via the same hooks (TanStack Query dedupes by
 * key, no extra network calls) since it's a genuinely different layout on
 * mobile, not just a restyle.
 *
 * Heart and message icons are decorative — no favorites endpoint exists
 * (docs/design/home-page-data-plan.md §7) and Messages has no inbox UI yet
 * — but the real design shows them, so they're rendered non-functional
 * rather than omitted, same treatment as the Property Feature filter.
 */
export function MobileHomeHeader() {
  const { data: profile } = useProfile();
  const { data: kycStatus } = useMyKycStatus();
  const { data: notifications } = useUnreadNotifications();
  const isVerified = kycStatus === "approved";

  return (
    <div className="flex items-start justify-between sm:hidden">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
            {profile?.avatarUrl ? (
              <Image src={profile.avatarUrl} alt="" fill className="object-cover" />
            ) : (
              <User className="absolute inset-0 m-auto size-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-base font-semibold text-foreground">
              {profile?.displayName ?? "…"}
            </p>
            {isVerified && (
              <span className="flex items-center gap-0.5 rounded-full bg-muted px-1 py-1 text-[10px] font-medium text-muted-foreground">
                <BadgeCheck className="size-3.5 text-success" />
                Verified
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Find verified homes near you</p>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <Heart className="size-6 text-foreground" />
        <span className="flex size-6 items-center justify-center rounded-full bg-black/[0.06]">
          <MessageCircle className="size-3.5 text-foreground" />
        </span>
        <span className="relative flex size-6 items-center justify-center rounded-full bg-black/[0.06]">
          <Bell className="size-3.5 text-foreground" />
          {notifications && notifications.count > 0 && (
            <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-[#d62c01] text-[8px] font-medium text-white">
              {notifications.count}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
