"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { isApiError } from "@/lib/api/errors";
import { useSwitchRole } from "@/features/profile";
import type { UserRole } from "@/config/constants";

/**
 * Self-service role switch — `PUT /api/profile/role`. Only the four
 * consumer-facing roles are offered; the professional/staff roles
 * (lawyer/surveyor/admin) are provisioned through the separate admin flow,
 * not self-selected here.
 *
 * IMPORTANT (docs/design/shortlet-implementation-plan.md, Gap 2): the backend
 * hasn't documented which roles are allowed to switch, or exactly which one
 * "shortlet owner" maps to. This offers all four and surfaces the real
 * backend error if a particular switch is rejected, rather than guessing the
 * allowed set. The role labels note capability (list vs. transact) so a user
 * understands why they'd switch — e.g. a shortlet host switches to Landlord.
 */
const SWITCHABLE_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "buyer", label: "Buyer", description: "Browse and make offers on properties for sale" },
  { value: "tenant", label: "Renter", description: "Find and rent long-term properties" },
  {
    value: "landlord",
    label: "Landlord / Host",
    description: "List properties for rent and short-stays",
  },
  { value: "seller", label: "Seller", description: "List properties for sale" },
];

export function RoleSwitchDialog({
  open,
  onOpenChange,
  currentRole,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: UserRole | undefined;
}) {
  const switchRole = useSwitchRole();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const target = selected ?? currentRole ?? null;
  const changed = target != null && target !== currentRole;

  function handleSave() {
    if (!target || !changed) return;
    switchRole.mutate(target, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch account role</DialogTitle>
          <DialogDescription>
            Change what you can do on Crest. You can switch back anytime.
          </DialogDescription>
        </DialogHeader>

        <div role="radiogroup" aria-label="Account role" className="space-y-2">
          {SWITCHABLE_ROLES.map((role) => {
            const isCurrent = role.value === currentRole;
            const isSelected = role.value === target;
            return (
              <button
                key={role.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(role.value)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                  isSelected ? "border-primary bg-primary/5" : "hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                    isSelected ? "border-primary" : "border-input",
                  )}
                >
                  {isSelected && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {role.label}
                    {isCurrent && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Current
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-muted-foreground">{role.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        {switchRole.isError && (
          <p className="text-sm text-destructive">
            {isApiError(switchRole.error)
              ? switchRole.error.message
              : "Couldn't switch your role — try again."}
          </p>
        )}

        <Button type="button" onClick={handleSave} disabled={!changed || switchRole.isPending}>
          {switchRole.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Switching…
            </>
          ) : (
            "Switch role"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
