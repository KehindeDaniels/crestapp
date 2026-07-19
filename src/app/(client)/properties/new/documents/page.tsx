"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, FileText, X, UploadCloud, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatFileSize } from "@/lib/utils/format";
import { isApiError } from "@/lib/api/errors";
import {
  useListPropertyWizardStore,
  useCreateProperty,
  useUploadPropertyMedia,
  useUploadDocument,
  LIST_PROPERTY_PURPOSE_CARDS,
  DEFAULT_DOCUMENT_TYPE,
} from "@/features/properties";

const TYPE_LABEL: Record<string, string> = {
  apartment: "Apartment",
  land: "Land",
};

/**
 * Step 4 of 4. Rebuilt against a real Figma pull (node 1473:3105 in file
 * `1jtfoprMGUFfoo3CBzhjMV`) — this is genuinely the final step, not a
 * summary/review screen: it's "Set up your payout details" (shown,
 * disabled — the fields only exist as commented-out validation hints on
 * `PUT /api/profile`, never live-tested) + "Verify your documents" (real,
 * via `documents/upload`) and its button submits directly.
 *
 * Document upload is a plain growing list, not 5 fixed named slots —
 * corrected after user testing confirmed the Figma pull's 5 labeled rows
 * (C of O, Deed of Assignment, etc.) are examples of already-uploaded
 * files, not distinct input fields; same interaction model as the image
 * uploader in step 2. On success, a "Listing Under Review" confirmation
 * modal matches the design's own post-submit screen.
 */
export default function ListPropertyDocumentsPage() {
  const router = useRouter();
  const wizard = useListPropertyWizardStore();
  const createProperty = useCreateProperty();
  const uploadMedia = useUploadPropertyMedia();
  const uploadDocument = useUploadDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<File[]>(wizard.documents);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    propertyId: number;
  } | null>(null);

  useEffect(() => {
    if (!wizard.mediaComplete) router.replace("/properties/new/review");
    // Mount-only guard — same pattern as the register wizard's step guards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!wizard.mediaComplete || !wizard.purpose || !wizard.propertyType)
    return null;

  const isSubmitting =
    createProperty.isPending ||
    uploadMedia.isPending ||
    uploadDocument.isPending;
  const firstImagePreview = wizard.images[0]
    ? URL.createObjectURL(wizard.images[0])
    : null;

  function addDocuments(files: FileList | null) {
    if (!files) return;
    setDocuments((prev) => {
      const next = [...prev, ...Array.from(files)];
      wizard.setDocuments(next);
      return next;
    });
  }

  function removeDocument(index: number) {
    setDocuments((prev) => {
      const next = prev.filter((_, i) => i !== index);
      wizard.setDocuments(next);
      return next;
    });
  }

  async function handleSubmit() {
    setError(null);
    try {
      const response = await createProperty.mutateAsync({
        purpose: wizard.purpose!,
        title: wizard.title,
        description: wizard.description,
        property_type: wizard.propertyType!,
        price: wizard.price,
        currency: "NGN",
        location_address: wizard.locationAddress,
        city: wizard.city,
        state: wizard.state,
        country: "Nigeria",
        bedrooms: wizard.bedrooms,
        bathrooms: wizard.bathrooms,
        square_meters: wizard.squareMeters,
      });

      const propertyId = response.data?.property_id;
      if (!propertyId) {
        setError(
          "Listing created, but we couldn't confirm its ID — check your listings from Home.",
        );
        wizard.reset();
        return;
      }

      if (wizard.images.length > 0) {
        const formData = new FormData();
        for (const file of wizard.images)
          formData.append("media_files[]", file);
        formData.append("media_type", "image");
        try {
          await uploadMedia.mutateAsync({ propertyId, formData });
        } catch {
          toast.warning(
            "Listing created, but photo upload failed — add photos later.",
          );
        }
      }

      if (documents.length > 0) {
        await Promise.allSettled(
          documents.map((file) => {
            const formData = new FormData();
            formData.append("title", file.name);
            formData.append("document_file", file);
            formData.append("document_type", DEFAULT_DOCUMENT_TYPE);
            formData.append(
              "description",
              `Supporting document for ${wizard.title}`,
            );
            formData.append("entity_type", "property");
            formData.append("entity_id", String(propertyId));
            formData.append("association_type", "supporting");
            return uploadDocument.mutateAsync(formData);
          }),
        );
      }

      setConfirmation({ propertyId });
    } catch (err) {
      setError(
        isApiError(err)
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-8xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LIST_PROPERTY_PURPOSE_CARDS.map((card) => {
          const Icon = card.icon;
          const isSelected = wizard.purpose === card.value;
          return (
            <div
              key={card.value}
              className={`bg-background flex items-start gap-3 rounded-xl border p-4 ${
                isSelected ? "shadow-md" : "border-border opacity-50"
              }`}
            >
              <Icon className="text-muted-foreground size-8 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{card.label}</p>
                <p className="text-muted-foreground text-xs">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/properties/new/review"
          className="text-muted-foreground flex items-center gap-1 text-sm font-medium"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <p className="text-muted-foreground text-xs font-medium">Step 4 of 4</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div
          className="space-y-5 rounded-2xl border p-5"
          title="Not confirmed — these fields only exist as commented-out validation hints on PUT /api/profile, never live-tested"
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold">
              Set up your payout details
            </h2>
            <p className="text-muted-foreground text-xs">
              Receive payments directly into your bank account after successful
              transactions
            </p>
          </div>
          <div className="space-y-3">
            <label className="text-muted-foreground/60 text-sm font-medium">
              Bank Name
            </label>
            <Select size="xl" disabled defaultValue="">
              <option value="">Enter</option>
            </Select>
          </div>
          <div className="space-y-3">
            <label className="text-muted-foreground/60 text-sm font-medium">
              Account Number
            </label>
            <Input size="xl" disabled placeholder="Enter" />
          </div>
          <div className="space-y-3">
            <label className="text-muted-foreground/60 text-sm font-medium">
              Account Name
            </label>
            <Input
              size="xl"
              disabled
              placeholder="Auto-verified from account number"
            />
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border p-5">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Verify your documents</h2>
            <p className="text-muted-foreground text-xs">
              Upload documents that prove ownership or legal right to list this
              property
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => {
              addDocuments(e.target.files);
              e.target.value = "";
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-input bg-input-background text-muted-foreground flex w-full flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-sm"
          >
            <UploadCloud className="size-6" />
            Upload Files
            <span className="text-xs">Tap to upload PDF, JPG, or PNG</span>
          </button>

          {documents.length > 0 && (
            <ul className="space-y-2">
              {documents.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
                >
                  <FileText className="text-muted-foreground size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDocument(i)}
                    aria-label={`Remove ${file.name}`}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button
        type="button"
        size="xl"
        className="w-full"
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Publishing…" : "List Property"}
      </Button>

      <Dialog
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open) router.push("/home");
        }}
      >
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Listing Under Review
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-center text-sm">
            Our team is currently reviewing your documents, we will notify you
            once verified
          </p>

          {firstImagePreview && (
            /* eslint-disable-next-line @next/next/no-img-element -- transient blob: URL, next/image can't optimize these anyway. */
            <img
              src={firstImagePreview}
              alt=""
              className="h-48 w-full rounded-2xl object-cover"
            />
          )}

          <div>
            <p className="text-muted-foreground text-sm">
              {wizard.purpose === "rent" ? "Rent" : "For Sale"}
            </p>
            <p className="text-xl font-bold">{formatCurrency(wizard.price)}</p>
            <p className="text-muted-foreground text-sm">
              {wizard.propertyType === "apartment"
                ? `${wizard.bedrooms} bd ${TYPE_LABEL[wizard.propertyType]}`
                : TYPE_LABEL[wizard.propertyType ?? "apartment"]}
            </p>
            <p className="text-muted-foreground text-sm">
              {wizard.city}, {wizard.state}
            </p>
          </div>

          <p className="text-sm font-medium">
            Status: <span className="text-[#faae16]">Under Review</span>
          </p>

          <div className="flex items-start gap-2 rounded-lg bg-[#faae16]/5 p-3">
            <Info className="mt-0.5 size-4 shrink-0 text-[#faae16]" />
            <p className="text-muted-foreground text-sm">
              Listing without documents will not be marked as verified.
            </p>
          </div>

          <Button
            type="button"
            size="xl"
            className="w-full"
            onClick={() => {
              wizard.reset();
              router.push("/home");
            }}
          >
            Go to Listings
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
