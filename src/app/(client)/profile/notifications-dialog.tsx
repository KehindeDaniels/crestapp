"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  type NotificationPreferences,
} from "@/features/notifications";

/**
 * Simpler than the Figma design on purpose — the confirmed `PUT
 * /api/notifications/preferences` body is 3 plain booleans
 * (email/sms/push), no "Immediately/Daily/Off" tiering and no separate
 * "Chats Notification" toggle. Building the extra granularity would mean
 * inventing fields the backend doesn't have. See
 * docs/design-vs-backend-gaps.md, Phase 12.
 *
 * Each toggle saves immediately on click (reading straight from the query,
 * no local draft state to keep in sync with an async fetch) rather than a
 * batch-then-Save form — simpler than juggling "draft hasn't loaded yet."
 */
export function NotificationsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: preferences, isPending } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  function toggle(field: keyof NotificationPreferences, value: boolean) {
    if (!preferences) return;
    updatePreferences.mutate({ ...preferences, [field]: value });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification settings</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !preferences ? (
          <p className="text-sm text-destructive">Couldn&apos;t load your preferences.</p>
        ) : (
          <div className="space-y-4">
            <ToggleRow
              label="Push notifications"
              description="Get updates on listings, transaction status, new listings"
              value={preferences.push_notifications}
              onChange={(v) => toggle("push_notifications", v)}
            />
            <ToggleRow
              label="Email notifications"
              description="Get updates on your favourite listings and alerts for new properties"
              value={preferences.email_notifications}
              onChange={(v) => toggle("email_notifications", v)}
            />
            <ToggleRow
              label="SMS notifications"
              description="Get text alerts for important account and transaction updates"
              value={preferences.sms_notifications}
              onChange={(v) => toggle("sms_notifications", v)}
            />
          </div>
        )}

        {updatePreferences.isError && (
          <p className="text-sm text-destructive">Couldn&apos;t save that change — try again.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        {([true, false] as const).map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium",
              value === option ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {option ? "On" : "Off"}
          </button>
        ))}
      </div>
    </div>
  );
}
