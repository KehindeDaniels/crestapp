"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateProfile, type FullProfileModel } from "@/features/profile";

/**
 * "My Accounts" — real, via the same `PUT /api/profile` endpoint as the
 * rest of the profile (bank_name/account_number/account_name), corrected
 * from an earlier, wrong claim this session that no payout endpoint
 * existed. See docs/design-vs-backend-gaps.md, Phase 12. Account Name is
 * shown read-only once a name has been entered, matching the Figma
 * screenshot's greyed "Account Name" field — but there's no confirmed
 * bank-lookup/name-resolution endpoint behind that, so it's just editable
 * text here, not an auto-resolved value from the account number.
 */
export function PaymentMethodDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: FullProfileModel;
}) {
  const updateProfile = useUpdateProfile();
  // No effect needed — the parent remounts this component (via a changing
  // `key`) each time it opens, so these initial values are always current.
  const [bankName, setBankName] = useState(profile.bankAccount?.bank_name ?? "");
  const [accountNumber, setAccountNumber] = useState(profile.bankAccount?.account_number ?? "");
  const [accountName, setAccountName] = useState(profile.bankAccount?.account_name ?? "");

  function handleSave() {
    updateProfile.mutate(
      {
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My Accounts</DialogTitle>
          <DialogDescription>
            Receive payments directly into your bank account after successful transactions.
          </DialogDescription>
        </DialogHeader>

        {profile.bankAccount?.bank_name && (
          <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
            <Landmark className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium">{profile.bankAccount.bank_name}</p>
          </div>
        )}

        <div className="space-y-4 rounded-xl border p-4">
          <p className="text-sm font-semibold">
            {profile.bankAccount?.bank_name ? "Update account" : "Add new account"}
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input id="bank-name" placeholder="Enter" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-number">Account Number</Label>
            <Input
              id="account-number"
              placeholder="Enter"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              placeholder="Enter"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>
        </div>

        {updateProfile.isError && (
          <p className="text-sm text-destructive">Couldn&apos;t save your account — try again.</p>
        )}

        <div className="flex flex-col gap-2">
          <Button type="button" onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
