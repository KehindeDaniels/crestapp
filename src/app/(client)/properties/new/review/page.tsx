"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { isApiError } from "@/lib/api/errors";
import {
  useListPropertyWizardStore,
  useCreateProperty,
  useUploadPropertyMedia,
} from "@/features/properties";

const TYPE_LABEL: Record<string, string> = { apartment: "Apartment", land: "Land" };
const PURPOSE_LABEL: Record<string, string> = { sale: "Sale", rent: "Rent" };

export default function ListPropertyReviewPage() {
  const router = useRouter();
  const wizard = useListPropertyWizardStore();
  const createProperty = useCreateProperty();
  const uploadMedia = useUploadPropertyMedia();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wizard.mediaComplete) router.replace("/properties/new/media");
    // Mount-only guard — same pattern as the register wizard's step guards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!wizard.mediaComplete || !wizard.purpose || !wizard.propertyType) return null;

  const isSubmitting = createProperty.isPending || uploadMedia.isPending;

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
        for (const file of wizard.images) formData.append("media_files[]", file);
        formData.append("media_type", "image");
        try {
          await uploadMedia.mutateAsync({ propertyId, formData });
        } catch {
          toast.warning("Listing created, but photo upload failed — add photos later.");
        }
      }

      wizard.reset();
      toast.success("Your property has been listed.");
      router.push(`/properties/${propertyId}`);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <Link
          href="/properties/new/media"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <p className="text-xs font-medium text-muted-foreground">Step 3 of 3</p>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">Review your listing</h1>
        <p className="text-sm text-muted-foreground">
          Check everything looks right before publishing.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{wizard.title}</h2>
          <Link href="/properties/new/media" className="text-xs font-medium text-primary">
            Edit
          </Link>
        </div>
        <p className="text-2xl font-bold">{formatCurrency(wizard.price)}</p>
        <p className="text-sm text-muted-foreground">
          {PURPOSE_LABEL[wizard.purpose]} · {TYPE_LABEL[wizard.propertyType]}
        </p>
        <p className="text-sm text-muted-foreground">
          {wizard.locationAddress}, {wizard.city}, {wizard.state}
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Details</h2>
          <Link href="/properties/new" className="text-xs font-medium text-primary">
            Edit
          </Link>
        </div>
        <dl className="space-y-2 text-sm">
          {wizard.propertyType === "apartment" && (
            <>
              <Row label="Bedrooms" value={String(wizard.bedrooms)} />
              <Row label="Bathrooms" value={String(wizard.bathrooms)} />
            </>
          )}
          <Row
            label={wizard.propertyType === "land" ? "Land Size" : "Property Size"}
            value={`${wizard.squareMeters} sqm`}
          />
        </dl>
        <p className="border-t pt-3 text-sm text-muted-foreground">{wizard.description}</p>
      </div>

      <div className="space-y-3 rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Photos ({wizard.images.length})</h2>
          <Link href="/properties/new/media" className="text-xs font-medium text-primary">
            Edit
          </Link>
        </div>
        {wizard.images.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto">
            {wizard.images.map((file, i) => (
              <PhotoPreview key={`${file.name}-${i}`} file={file} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No photos added.</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        size="xl"
        className="w-full"
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Publishing…" : "Publish Listing"}
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function PhotoPreview({ file }: { file: File }) {
  const [url] = useState(() => URL.createObjectURL(file));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  // eslint-disable-next-line @next/next/no-img-element -- transient blob: URL, next/image can't optimize these anyway.
  return <img src={url} alt="" className="size-20 shrink-0 rounded-lg object-cover" />;
}
