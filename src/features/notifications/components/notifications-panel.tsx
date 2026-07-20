"use client";

import {
  Bell,
  Building2,
  ChevronRight,
  Loader2,
  MessageCircle,
  Receipt,
  Shield,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useNotificationsList, useMarkNotificationAsRead } from "../hooks";
import type { ApiNotification } from "../types";

/**
 * Real Figma pull (node 1551-7332, file `8YqDLQnhJoIRLV1xEOXZcR` — a
 * different file key than every other screen this session) — a dropdown
 * panel anchored to the topbar bell, not a separate page.
 *
 * Only one real `notification_type` value has ever been confirmed
 * (`kyc_approved`, see docs/design/home-page-data-plan.md §2c) — the
 * per-type icon below is a substring-matching heuristic over whatever
 * string the backend sends, not a confirmed enum mapping. `status` (the
 * pill) is a real confirmed field, unlike the icon choice.
 *
 * Rows mark-as-read on click but don't navigate anywhere: `ApiNotification`
 * has no `reference_id`/`reference_type` (unlike messages), so there's
 * nothing confirmed to link to. The chevron in the design implies rows go
 * somewhere — flagged as a gap in docs/design-vs-backend-gaps.md, not
 * guessed at here.
 */
export function NotificationsPanel() {
  const { data: notifications, isLoading } = useNotificationsList();
  const markAsRead = useMarkNotificationAsRead();

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <div className="sticky top-0 border-b bg-background px-4 py-3">
        <p className="text-sm font-semibold">Notifications</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && notifications?.length === 0 && (
        <p className="p-8 text-center text-sm text-muted-foreground">
          No notifications yet.
        </p>
      )}

      {notifications?.map((notification) => (
        <NotificationRow
          key={notification.notification_id}
          notification={notification}
          onClick={() => {
            if (notification.is_read === 0) {
              markAsRead.mutate(notification.notification_id);
            }
          }}
        />
      ))}
    </div>
  );
}

// No `--warning` design token exists yet (same gap noted in the List
// Property confirmation modal) — reusing the same arbitrary hex there
// rather than inventing a new token for a second one-off use.
const STATUS_STYLES: Record<string, string> = {
  completed: "bg-success/10 text-success",
  pending: "bg-[#faae16]/10 text-[#faae16]",
  in_progress: "bg-muted text-muted-foreground",
  "in-progress": "bg-muted text-muted-foreground",
};

/**
 * A real (stable, module-level) component that branches internally, rather
 * than a function returning a component reference to assign to a local
 * `const Icon = ...` — the latter trips the `static-components` lint rule
 * (it can't statically prove the returned reference is stable across
 * renders, even though here it always is).
 */
function NotificationTypeIcon({ type, className }: { type: string; className?: string }) {
  const t = type.toLowerCase();
  if (t.includes("kyc")) return <Shield className={className} />;
  if (t.includes("message") || t.includes("chat")) return <MessageCircle className={className} />;
  if (t.includes("transaction")) return <Receipt className={className} />;
  if (t.includes("propert") || t.includes("listing")) return <Building2 className={className} />;
  return <Bell className={className} />;
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: ApiNotification;
  onClick: () => void;
}) {
  const statusClass = STATUS_STYLES[notification.status?.toLowerCase()] ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-accent",
        notification.is_read === 0 && "bg-accent/40",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <NotificationTypeIcon
          type={notification.notification_type}
          className="size-4.5 text-muted-foreground"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{notification.title}</p>
        <p className="truncate text-xs text-muted-foreground">{notification.message}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {formatDate(notification.created_at, { dateStyle: "medium" })}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {statusClass && (
          <span className={cn("rounded-full px-2 py-1 text-[10px] font-medium capitalize", statusClass)}>
            {notification.status}
          </span>
        )}
        <ChevronRight className="size-4 text-muted-foreground/50" />
      </div>
    </button>
  );
}
