"use client";

import { useState } from "react";
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
 * `PUT /api/profile` only accepts `first_name`/`last_name`/`phone_number`/
 * `profile_picture_url`/`date_of_birth`/`bio`/`address`/`city`/`state`/
 * `country`/bank fields — no `email` field at all, and no "ID number"
 * anywhere. The Figma screenshot shows both as editable; email is read-only
 * here instead of silently failing to save, and ID number is dropped rather
 * than collected and discarded. See docs/design-vs-backend-gaps.md, Phase 12.
 */
export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: FullProfileModel;
}) {
  const updateProfile = useUpdateProfile();
  // No effect needed to reset these on open — Radix unmounts DialogContent's
  // children when closed, so this component remounts fresh (and re-reads
  // `profile`) every time it opens.
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phoneNumber);

  function handleSave() {
    updateProfile.mutate(
      { first_name: firstName.trim(), last_name: lastName.trim(), phone_number: phone.trim() },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your personal details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-first-name">First name</Label>
            <Input id="edit-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-last-name">Last name</Label>
            <Input id="edit-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" value={profile.email} disabled title="Email can't be changed here" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone number</Label>
            <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        {updateProfile.isError && (
          <p className="text-sm text-destructive">Couldn&apos;t save your changes — try again.</p>
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
