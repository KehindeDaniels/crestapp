import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

/** Persistent sidebar + topbar shell for the authenticated client app (renter/buyer/agent/landlord area). */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
