"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS, LOG_OUT_ICON } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="hidden h-screen w-63 shrink-0 flex-col bg-muted lg:flex">
      <div className="flex items-center gap-2 px-5 pt-6 pb-4">
        <Image
          src="/images/auth/shared/logo-lockup.png"
          alt="Crest"
          width={122}
          height={37}
          className="h-8 w-auto"
        />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-5 pt-8">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium text-muted-foreground/50"
                title="Coming soon"
              >
                <Icon className="size-5.5" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent",
              )}
            >
              <Icon className="size-5.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 pb-6">
        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          <LOG_OUT_ICON className="size-5.5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
