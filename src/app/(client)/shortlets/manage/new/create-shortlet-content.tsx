"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Plus, Trash2, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { DocumentUploader, type TypedDocument } from "@/components/ui/document-uploader";
import { apiErrorMessage } from "@/lib/api/errors";
import { useCreateShortlet } from "@/features/shortlets";
import { useUploadPropertyMedia, useUploadVerificationDocument } from "@/features/properties";

/**
 * Create shortlet listing — `POST /api/shortlets`. Country/currency are fixed
 * (Nigeria/NGN, same as the property-creation wizard).
 *
 * Creating a shortlet also creates the underlying *property* (the create
 * response returns its `property_id`). We use that id to, in one flow:
 *  1. upload photos → `POST /api/properties/{id}/media`, and
 *  2. upload ownership documents → `POST /api/properties/{id}/verification/documents`.
 * The ownership-document step is what unblocks the admin approval queue — the
 * general `/api/documents/upload` (legal) track does NOT feed it, and uploading
 * a document already moves the property into that queue (so there's no separate
 * `/verification/submit` call).
 *
 * The listing is NOT activated here: a new shortlet is `pending` and goes
 * `active` on its own once an admin approves the documents (the backend rejects
 * a manual `PUT status:active` on a pending listing). See
 * docs/design/shortlet-implementation-plan.md.
 *
 * IMPORTANT: whether the backend allows the current account's role to create
 * a shortlet at all is unconfirmed (plan Gap 2) — a real backend error
 * (e.g. 403) is surfaced verbatim rather than pre-gated in the UI.
 */

/**
 * Ownership `document_type` enum for `POST /.../verification/documents` —
 * confirmed from the collection's validate-documents response (`c_of_o`,
 * `deed`, `survey_plan`, `govt_consent`, `receipt`). Sending anything else
 * 422s with "The selected document type is invalid."
 */
const VERIFICATION_DOCUMENT_TYPES = [
  { value: "c_of_o", label: "Certificate of Occupancy (C of O)" },
  { value: "deed", label: "Deed of Assignment" },
  { value: "survey_plan", label: "Survey Plan" },
  { value: "govt_consent", label: "Governor's Consent" },
  { value: "receipt", label: "Purchase Receipt" },
];
interface RoomDraft {
  name: string;
  room_type: string;
  capacity: number;
  beds: number;
  nightly_rate: number;
}

const PROPERTY_TYPES = ["apartment", "house"];
const ROOM_TYPES = ["studio", "ensuite", "standard", "deluxe", "suite"];
const CANCELLATION_POLICIES = ["flexible", "moderate", "strict"];

function newRoom(): RoomDraft {
  return { name: "", room_type: "standard", capacity: 2, beds: 1, nightly_rate: 0 };
}

export function CreateShortletContent() {
  const router = useRouter();
  const createShortlet = useCreateShortlet();
  const uploadMedia = useUploadPropertyMedia();
  const uploadVerificationDoc = useUploadVerificationDocument();

  const [photos, setPhotos] = useState<File[]>([]);
  const [documents, setDocuments] = useState<TypedDocument[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("apartment");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [squareMeters, setSquareMeters] = useState(0);
  const [baseRate, setBaseRate] = useState(0);
  const [cleaningFee, setCleaningFee] = useState(0);
  const [serviceFeeBps, setServiceFeeBps] = useState(500);
  const [minNights, setMinNights] = useState(1);
  const [maxNights, setMaxNights] = useState(14);
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [instantBook, setInstantBook] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState("flexible");
  const [rooms, setRooms] = useState<RoomDraft[]>([newRoom()]);

  function updateRoom(index: number, patch: Partial<RoomDraft>) {
    setRooms((prev) => prev.map((room, i) => (i === index ? { ...room, ...patch } : room)));
  }

  const canSubmit =
    title.trim() && address.trim() && city.trim() && baseRate > 0 && rooms.every((r) => r.name.trim());

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const created = await createShortlet.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        property_type: propertyType,
        location_address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: "Nigeria",
        bedrooms,
        bathrooms,
        square_meters: squareMeters,
        base_nightly_rate: baseRate,
        currency: "NGN",
        min_nights: minNights,
        max_nights: maxNights,
        check_in_time: checkInTime,
        instant_book: instantBook,
        cleaning_fee: cleaningFee,
        service_fee_bps: serviceFeeBps,
        cancellation_policy: cancellationPolicy,
        rooms: rooms.map((room, i) => ({ ...room, sort_order: i })),
      });

      const listingId = created.data.listing_id;
      const propertyId = created.data.property_id ?? created.data.property?.property_id;

      // Uploads target the underlying property. If the create response somehow
      // omits its id we skip them (rather than fail the whole create) — the
      // listing still exists and the owner can add photos/documents later.
      if (propertyId != null && photos.length > 0) {
        const formData = new FormData();
        for (const file of photos) formData.append("media_files[]", file);
        formData.append("media_type", "image");
        try {
          await uploadMedia.mutateAsync({ propertyId, formData });
        } catch {
          toast.warning("Listing created, but photo upload failed — add photos later.");
        }
      }

      if (propertyId != null && documents.length > 0) {
        // Each document carries its own type. Uploading a document already
        // moves the property into the admin's pending queue, so there's NO
        // explicit `/verification/submit` call — that endpoint 400s once the
        // property is already pending, and would just be noise.
        const results = await Promise.allSettled(
          documents.map(({ file, type }) => {
            const formData = new FormData();
            formData.append("document_type", type);
            formData.append("document_file", file);
            return uploadVerificationDoc.mutateAsync({ propertyId, formData });
          }),
        );
        // Surface the *real* backend reason (incl. Laravel 422 field messages)
        // rather than a generic notice — document upload is the whole point of
        // getting admin approval, so a failure needs to be visible/actionable.
        const rejected = results.find(
          (r): r is PromiseRejectedResult => r.status === "rejected",
        );
        if (rejected) {
          toast.error(
            `Document upload failed: ${apiErrorMessage(rejected.reason, "Please try again.")}`,
            { duration: 12000 },
          );
        }
      }

      router.push(`/shortlets/manage/${listingId}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't create this shortlet — try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-10">
      <Link
        href="/shortlets/manage"
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="size-4" />
        My shortlets
      </Link>

      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">Add a shortlet</h1>
        <p className="text-sm text-muted-foreground">
          Add your listing, rooms, photos and ownership documents. It starts as{" "}
          <span className="font-medium">pending</span> and goes live automatically once an admin
          approves your documents.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border p-5">
        <h2 className="text-base font-semibold">Property basics</h2>
        <Field label="Title" htmlFor="s-title">
          <Input id="s-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lekki Waterfront Shortlet" />
        </Field>
        <Field label="Description" htmlFor="s-desc">
          <textarea
            id="s-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Modern 2-unit shortlet with WiFi and parking"
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring"
          />
        </Field>
        <Field label="Property type" htmlFor="s-type">
          <Select id="s-type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Address" htmlFor="s-addr">
          <Input id="s-addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 Admiralty Way" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" htmlFor="s-city">
            <Input id="s-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lagos" />
          </Field>
          <Field label="State" htmlFor="s-state">
            <Input id="s-state" value={state} onChange={(e) => setState(e.target.value)} placeholder="Lagos" />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Bedrooms" htmlFor="s-beds">
            <Input id="s-beds" type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
          </Field>
          <Field label="Bathrooms" htmlFor="s-baths">
            <Input id="s-baths" type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
          </Field>
          <Field label="Sq. meters" htmlFor="s-sqm">
            <Input id="s-sqm" type="number" min={0} value={squareMeters} onChange={(e) => setSquareMeters(Number(e.target.value))} />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border p-5">
        <h2 className="text-base font-semibold">Pricing & rules</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Base rate / night (₦)" htmlFor="s-rate">
            <Input id="s-rate" type="number" min={0} value={baseRate} onChange={(e) => setBaseRate(Number(e.target.value))} />
          </Field>
          <Field label="Cleaning fee (₦)" htmlFor="s-clean">
            <Input id="s-clean" type="number" min={0} value={cleaningFee} onChange={(e) => setCleaningFee(Number(e.target.value))} />
          </Field>
          <Field label="Service fee (bps)" htmlFor="s-svc">
            <Input id="s-svc" type="number" min={0} value={serviceFeeBps} onChange={(e) => setServiceFeeBps(Number(e.target.value))} />
          </Field>
          <Field label="Check-in time" htmlFor="s-checkin">
            <Input id="s-checkin" type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />
          </Field>
          <Field label="Min nights" htmlFor="s-min">
            <Input id="s-min" type="number" min={1} value={minNights} onChange={(e) => setMinNights(Number(e.target.value))} />
          </Field>
          <Field label="Max nights" htmlFor="s-max">
            <Input id="s-max" type="number" min={1} value={maxNights} onChange={(e) => setMaxNights(Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Cancellation policy" htmlFor="s-cancel">
          <Select id="s-cancel" value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)}>
            {CANCELLATION_POLICIES.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={instantBook}
            onChange={(e) => setInstantBook(e.target.checked)}
            className="size-4"
          />
          Instant book (guests can book without approval)
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Rooms</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setRooms((r) => [...r, newRoom()])}>
            <Plus className="size-4" />
            Add room
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Add at least one room. Each is a separate bookable unit under this listing.
        </p>
        {rooms.map((room, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Room {i + 1}</p>
              {rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRooms((r) => r.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove room"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <Field label="Name" htmlFor={`room-name-${i}`}>
              <Input
                id={`room-name-${i}`}
                value={room.name}
                onChange={(e) => updateRoom(i, { name: e.target.value })}
                placeholder="Room A - Studio"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type" htmlFor={`room-type-${i}`}>
                <Select
                  id={`room-type-${i}`}
                  value={room.room_type}
                  onChange={(e) => updateRoom(i, { room_type: e.target.value })}
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Nightly rate (₦)" htmlFor={`room-rate-${i}`}>
                <Input
                  id={`room-rate-${i}`}
                  type="number"
                  min={0}
                  value={room.nightly_rate}
                  onChange={(e) => updateRoom(i, { nightly_rate: Number(e.target.value) })}
                />
              </Field>
              <Field label="Capacity" htmlFor={`room-cap-${i}`}>
                <Input
                  id={`room-cap-${i}`}
                  type="number"
                  min={1}
                  value={room.capacity}
                  onChange={(e) => updateRoom(i, { capacity: Number(e.target.value) })}
                />
              </Field>
              <Field label="Beds" htmlFor={`room-beds-${i}`}>
                <Input
                  id={`room-beds-${i}`}
                  type="number"
                  min={1}
                  value={room.beds}
                  onChange={(e) => updateRoom(i, { beds: Number(e.target.value) })}
                />
              </Field>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-5 rounded-2xl border p-5">
        <div className="space-y-3">
          <p className="text-sm font-semibold">Image (up to 30)</p>
          <ImageDropzone files={photos} onChange={setPhotos} />
        </div>

        <div
          className="space-y-2"
          title="Not built — the media endpoint's only confirmed media_type is 'image'"
        >
          <p className="text-sm font-semibold text-muted-foreground/60">Video (up to 2)</p>
          <div className="flex w-full cursor-not-allowed flex-col items-center gap-2 rounded-xl border border-dashed border-input bg-input-background py-8 text-sm text-muted-foreground/60">
            <Video className="size-6" />
            Upload your video or Browse
            <span className="text-xs">Max 1min video size are allowed</span>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border p-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Verify ownership documents</h2>
          <p className="text-xs text-muted-foreground">
            Upload documents that prove ownership or your legal right to list this space, and pick
            what each one is. Required before an admin can approve the listing.
          </p>
        </div>
        <DocumentUploader
          documents={documents}
          onChange={setDocuments}
          types={VERIFICATION_DOCUMENT_TYPES}
        />
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        className="w-full"
        disabled={!canSubmit || submitting}
        onClick={handleSubmit}
      >
        {submitting ? "Publishing…" : "Create shortlet"}
      </Button>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
