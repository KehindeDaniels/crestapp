"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRegisterWizardStore } from "@/features/auth";
import type { UserRole } from "@/config/constants";
import { cn } from "@/lib/utils/index";

/**
 * Role selection — relocated here from the post-login "After Account
 * Creation" screen's "What describes you best?" section (no dedicated Figma
 * frame of its own; visual treatment approximated from that screenshot).
 * Moved into registration because `POST /api/auth/register` requires `role`
 * and there's no backend endpoint for a user to set it after the fact — see
 * docs/design-vs-backend-gaps.md.
 *
 * Figma's options are Buyer/Renter/Property Owner/Short-Let; the backend's
 * actual role enum is landlord/tenant/seller/buyer/lawyer/surveyor/admin.
 * Mapped Buyer->buyer, Renter->tenant, Property Owner->landlord. "Short-Let"
 * has no backend equivalent and was dropped, not silently guessed.
 *
 * Rendered as checkbox-style squares (matching the Figma visual) but with
 * radio (single-select) semantics/behavior, since `role` is a single enum
 * field on the backend, not an array.
 */
const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: "Buyer", value: "buyer" },
  { label: "Renter", value: "tenant" },
  { label: "Property Owner", value: "landlord" },
];

export default function RegisterRolePage() {
  const router = useRouter();
  const phoneVerified = useRegisterWizardStore((s) => s.phoneVerified);
  const setRole = useRegisterWizardStore((s) => s.setRole);
  const [selected, setSelected] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!phoneVerified) router.replace("/register");
  }, [phoneVerified, router]);

  if (!phoneVerified) return null;

  function handleContinue() {
    if (!selected) return;
    setRole(selected);
    router.push("/register/password");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">What describes you best?</h1>
        <p className="text-sm text-muted-foreground">
          Tell us a bit about yourself so we can set up things correctly
        </p>
      </div>

      <div role="radiogroup" aria-label="What describes you best?" className="space-y-3">
        {ROLE_OPTIONS.map((option) => {
          const checked = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setSelected(option.value)}
              className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors hover:bg-accent"
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded border",
                  checked ? "border-primary bg-primary" : "border-input bg-transparent",
                )}
              >
                {checked && (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <path
                      d="M2 6l2.5 2.5L10 3"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>

      <Button type="button" className="w-full" disabled={!selected} onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
}
