"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLogout } from "@/features/auth";
import { cn } from "@/lib/utils/cn";
import { LogoIcon } from "./logo-icon";
import { NAV_ITEMS, LOG_OUT_ICON } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col bg-muted transition-[width] duration-200 lg:flex",
        collapsed ? "w-20" : "w-63",
      )}
    >
      <div
        className={cn(
          "flex items-center pt-6 pb-4",
          // Row layout doesn't leave enough width for logo + text + toggle
          // once collapsed (80px sidebar - padding leaves ~56px, the two
          // icons alone need ~68px side by side) — stack instead of
          // cramming them into one row.
          collapsed ? "flex-col gap-3 px-3" : "flex-row gap-2 px-5",
        )}
      >
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <LogoIcon size={32} />
          {!collapsed && (
            <span className="font-heading text-lg font-bold text-primary">
              Crest
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
            !collapsed && "ml-auto",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4.5" />
          ) : (
            <PanelLeftClose className="size-4.5" />
          )}
        </button>
      </div>

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

          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent",
              )}
            >
              <Icon className="size-5.5 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("pb-6", collapsed ? "px-3" : "px-5")}>
        <button
          type="button"
          onClick={() => logout.mutate()}
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
    </aside>
  );
}
