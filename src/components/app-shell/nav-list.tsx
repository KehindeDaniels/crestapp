"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth";
import { useUnreadMessageCount } from "@/features/messaging";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, LOG_OUT_ICON } from "./nav-config";

/**
 * Shared nav-item rendering between the desktop `Sidebar` (which can also
 * collapse to icons-only) and `MobileNav`'s drawer (always expanded,
 * `collapsed` is always false there). Extracted so both stay in sync rather
 * than maintaining two copies of the same enabled/disabled nav logic.
 */
export function NavList({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const logout = useLogout();
  const { data: unreadMessageCount } = useUnreadMessageCount();

  return (
    <>
      <nav
        className={cn(
          "flex flex-1 flex-col gap-1 overflow-y-auto pt-8",
          collapsed ? "px-3" : "px-5",
        )}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <span
                key={item.label}
                className={cn(
                  "flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium text-muted-foreground/50",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? `${item.label} — coming soon` : "Coming soon"}
              >
                <Icon className="size-5.5 shrink-0" />
                {!collapsed && item.label}
              </span>
            );
          }

          const showUnreadBadge =
            item.label === "Messages" && !!unreadMessageCount && unreadMessageCount > 0;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent",
              )}
            >
              <span className="relative shrink-0">
                <Icon className="size-5.5" />
                {showUnreadBadge && (
                  <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-medium text-white">
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </span>
                )}
              </span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("pb-6", collapsed ? "px-3" : "px-5")}>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            logout.mutate();
          }}
          disabled={logout.isPending}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50",
            collapsed && "justify-center px-0",
          )}
        >
          <LOG_OUT_ICON className="size-5.5 shrink-0" />
          {!collapsed && "Log out"}
        </button>
      </div>
    </>
  );
}
