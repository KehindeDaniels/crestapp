import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/**
 * Persistent sidebar + topbar shell for the authenticated client app
 * (renter/buyer/agent/landlord area).
 *
 * `min-w-0` on every flex item in this chain (this root, the content
 * column, `main`) is load-bearing, not decorative: without it, a flex
 * item's default `min-width: auto` lets its content's intrinsic
 * min-content size (e.g. a horizontally-scrolling row of fixed-width,
 * `shrink-0` property cards) win over the flex container's stretched
 * width, so the item — and everything above it — refuses to shrink below
 * that content width. That's what caused the page to grow unbounded and
 * jump/reflow on viewport-width changes (like toggling devtools).
 * `max-w-[1440px] mx-auto` caps the whole shell at a standard desktop
 * width instead of letting it stretch edge-to-edge on ultra-wide monitors.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-560 min-w-0">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
