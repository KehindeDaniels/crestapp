"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AmenitiesPicker } from "@/components/ui/amenities-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiErrorMessage } from "@/lib/api/errors";
import { useUpdateShortlet, type ShortletDetailModel } from "@/features/shortlets";
import type { ID } from "@/types/api";

const CANCELLATION_POLICIES = ["flexible", "moderate", "strict"];

interface FormState {
  title: string;
  description: string;
  baseRate: number;
  cleaningFee: number;
  serviceFeeBps: number;
  minNights: number;
  maxNights: number;
  checkInTime: string;
  instantBook: boolean;
  cancellationPolicy: string;
  amenities: string[];
}

function toForm(l: ShortletDetailModel): FormState {
  return {
    title: l.title,
    description: l.description ?? "",
    baseRate: l.pricePerNight,
    cleaningFee: l.cleaningFee,
    serviceFeeBps: l.serviceFeeBps ?? 0,
    minNights: l.minNights ?? 1,
    maxNights: l.maxNights ?? 1,
    // API returns "15:00:00"; <input type="time"> wants "HH:MM".
    checkInTime: (l.checkInTime ?? "15:00").slice(0, 5),
    instantBook: l.instantBook,
    cancellationPolicy: l.cancellationPolicy ?? "flexible",
    amenities: l.amenities,
  };
}

/**
 * Edit a shortlet listing's details — `PUT /api/shortlets/{id}` (partial
 * update). Room names/rates are NOT editable here: the update endpoint has no
 * `rooms` field, so this covers listing-level fields only.
 *
 * The "Caution fee" field maps to the backend's `cleaning_fee` — a cosmetic
 * rename. It stays non-refundable and added to the guest's total; a real
 * refundable deposit would need backend support (see ShortletDetailModel).
 */
export function EditListingDialog({
  listingId,
  listing,
  open,
  onOpenChange,
}: {
  listingId: ID;
  listing: ShortletDetailModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit listing</DialogTitle>
        </DialogHeader>
        {/* Inner form is mounted fresh each time the dialog opens (Radix unmounts
            content when closed), so `useState` re-seeds from the latest listing
            with no effect needed. */}
        <EditListingForm
          listingId={listingId}
          listing={listing}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditListingForm({
  listingId,
  listing,
  onClose,
}: {
  listingId: ID;
  listing: ShortletDetailModel;
  onClose: () => void;
}) {
  const update = useUpdateShortlet(listingId);
  const [form, setForm] = useState<FormState>(() => toForm(listing));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    setError(null);
    update.mutate(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        base_nightly_rate: form.baseRate,
        cleaning_fee: form.cleaningFee,
        service_fee_bps: form.serviceFeeBps,
        min_nights: form.minNights,
        max_nights: form.maxNights,
        check_in_time: form.checkInTime,
        instant_book: form.instantBook,
        cancellation_policy: form.cancellationPolicy,
        amenities: form.amenities,
      },
      {
        onSuccess: onClose,
        onError: (err) => setError(apiErrorMessage(err, "Couldn't save changes — try again.")),
      },
    );
  }

  return (
    <>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="e-title">Title</Label>
            <Input id="e-title" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-desc">Description</Label>
            <textarea
              id="e-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-rate">Base rate / night (₦)</Label>
              <Input
                id="e-rate"
                type="number"
                min={0}
                value={form.baseRate}
                onChange={(e) => set("baseRate", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              {/* Backend field is `cleaning_fee`; label only. Non-refundable, added to total. */}
              <Label htmlFor="e-caution">Caution fee (₦)</Label>
              <Input
                id="e-caution"
                type="number"
                min={0}
                value={form.cleaningFee}
                onChange={(e) => set("cleaningFee", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-svc">Service fee (bps)</Label>
              <Input
                id="e-svc"
                type="number"
                min={0}
                value={form.serviceFeeBps}
                onChange={(e) => set("serviceFeeBps", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-checkin">Check-in time</Label>
              <Input
                id="e-checkin"
                type="time"
                value={form.checkInTime}
                onChange={(e) => set("checkInTime", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-min">Min nights</Label>
              <Input
                id="e-min"
                type="number"
                min={1}
                value={form.minNights}
                onChange={(e) => set("minNights", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-max">Max nights</Label>
              <Input
                id="e-max"
                type="number"
                min={1}
                value={form.maxNights}
                onChange={(e) => set("maxNights", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-cancel">Cancellation policy</Label>
            <Select
              id="e-cancel"
              value={form.cancellationPolicy}
              onChange={(e) => set("cancellationPolicy", e.target.value)}
            >
              {CANCELLATION_POLICIES.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.instantBook}
              onChange={(e) => set("instantBook", e.target.checked)}
              className="size-4"
            />
            Instant book (guests can book without approval)
          </label>

          <div className="space-y-1.5">
            <Label>Amenities</Label>
            <AmenitiesPicker
              selected={form.amenities}
              onChange={(next) => set("amenities", next)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={update.isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
    </>
  );
}
