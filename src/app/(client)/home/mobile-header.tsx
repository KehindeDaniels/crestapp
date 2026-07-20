"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, BadgeCheck, Heart, MessageCircle, User } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useProfile } from "@/features/profile";
import { useMyKycStatus } from "@/features/kyc";
import { useUnreadNotifications, NotificationsPanel } from "@/features/notifications";
import { useUnreadMessageCount } from "@/features/messaging";

/**
 * Mobile-only (`sm:hidden`) — matches a real Figma mobile pull (node
 * 570:1225) exactly, not inferred from a screenshot. Desktop keeps the
 * simpler "Welcome back" heading + `Topbar`'s own avatar/bell instead;
 * this duplicates that data via the same hooks (TanStack Query dedupes by
 * key, no extra network calls) since it's a genuinely different layout on
 * mobile, not just a restyle.
 *
 * Heart is a shortcut to `/saved` (not a per-property toggle — there's no
 * single property in this header's context) and message is a shortcut to
 * `/messages`; both real destinations now that those features exist.
 */
export function MobileHomeHeader() {
  const { data: profile } = useProfile();
  const { data: kycStatus } = useMyKycStatus();
  const { data: notifications } = useUnreadNotifications();
  const { data: unreadMessageCount } = useUnreadMessageCount();
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
        <Link href="/saved" aria-label="Saved properties">
          <Heart className="size-6 text-foreground" />
        </Link>
        <Link
          href="/messages"
          aria-label="Messages"
          className="relative flex size-6 items-center justify-center rounded-full bg-black/[0.06]"
        >
          <MessageCircle className="size-3.5 text-foreground" />
          {!!unreadMessageCount && unreadMessageCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-[#d62c01] text-[8px] font-medium text-white">
              {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
            </span>
          )}
        </Link>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-6 items-center justify-center rounded-full bg-black/[0.06]"
            >
              <Bell className="size-3.5 text-foreground" />
              {notifications && notifications.count > 0 && (
                <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-[#d62c01] text-[8px] font-medium text-white">
                  {notifications.count}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="end">
            <NotificationsPanel />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
