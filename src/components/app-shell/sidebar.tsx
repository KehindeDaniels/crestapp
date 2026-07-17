"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LogoIcon } from "./logo-icon";
import { NavList } from "./nav-list";

/** Desktop only (`hidden lg:flex`) — below that, `MobileNav` (rendered from `Topbar`) takes over. */
export function Sidebar() {
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

      <NavList collapsed={collapsed} />
    </aside>
  );
}
