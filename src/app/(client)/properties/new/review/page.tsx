"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import { useListPropertyWizardStore, LIST_PROPERTY_PURPOSE_CARDS } from "@/features/properties";

const TYPE_LABEL: Record<string, string> = { apartment: "Apartment", land: "Land" };
const PURPOSE_LABEL: Record<string, string> = { sale: "For sale", rent: "For rent" };

/**
 * Step 3 of 4 — "Review Your Listing" (real Figma pull, node 1458:2429 in
 * file `1jtfoprMGUFfoo3CBzhjMV`), missed in the first pass, which assumed
 * step 2 led straight into Payout/Documents. This step is purely a summary
 * with "Edit" links back to the step that owns each field — it doesn't
 * collect anything new itself, so it just guards on the same
 * `mediaComplete` flag step 4 already required.
 */
export default function ListPropertyReviewPage() {
  const router = useRouter();
  const wizard = useListPropertyWizardStore();

  useEffect(() => {
    if (!wizard.mediaComplete) router.replace("/properties/new/media");
    // Mount-only guard — same pattern as the register wizard's step guards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!wizard.mediaComplete || !wizard.purpose || !wizard.propertyType) return null;
  const isLand = wizard.propertyType === "land";

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LIST_PROPERTY_PURPOSE_CARDS.map((card) => {
          const Icon = card.icon;
          const isSelected = wizard.purpose === card.value;
          return (
            <div
              key={card.value}
              className={`flex items-start gap-3 rounded-xl border bg-background p-4 ${
                isSelected ? "shadow-md" : "border-border opacity-50"
              }`}
            >
              <Icon className="size-8 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">{card.label}</p>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/properties/new/media"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <p className="text-xs font-medium text-muted-foreground">Step 3 of 4</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border p-5">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Review Your Listing</h2>
            <p className="text-xs text-muted-foreground">
              Recheck your listing before posting to ensure proper listing details
            </p>
          </div>

          <ReviewRow label="What I'm listing" editHref="/properties/new/details">
            {TYPE_LABEL[wizard.propertyType]} ({PURPOSE_LABEL[wizard.purpose]})
          </ReviewRow>

          {isLand ? (
            <ReviewRow label="Land Size" editHref="/properties/new/details">
              {wizard.squareMeters} sqm
            </ReviewRow>
          ) : (
            <>
              <p className="text-sm font-semibold">Rooms</p>
              <ReviewRow label="Bedroom" editHref="/properties/new/details">
                {wizard.bedrooms}
              </ReviewRow>
              <ReviewRow label="Bathroom" editHref="/properties/new/details">
                {wizard.bathrooms}
              </ReviewRow>
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Project Description</p>
              <Link href="/properties/new/details" className="text-xs text-muted-foreground">
                Edit
              </Link>
            </div>
            <p className="rounded-xl bg-muted px-3 py-3 text-sm">{wizard.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Price &amp; Location</p>
              <Link href="/properties/new/media" className="text-xs text-muted-foreground">
                Edit
              </Link>
            </div>
            <div className="space-y-1 rounded-xl bg-muted px-3 py-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{formatCurrency(wizard.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">
                  {wizard.city}, {wizard.state}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Display Title</p>
              <Link href="/properties/new/media" className="text-xs text-muted-foreground">
                Edit
              </Link>
            </div>
            <p className="rounded-xl bg-muted px-3 py-3 text-sm font-semibold">{wizard.title}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Images</p>
              <Link href="/properties/new/media" className="text-xs text-muted-foreground">
                Edit
              </Link>
            </div>
            {wizard.images[0] ? (
              <ReviewImage file={wizard.images[0]} count={wizard.images.length} />
            ) : (
              <p className="text-sm text-muted-foreground">No images added.</p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="button"
        size="xl"
        className="w-full"
        onClick={() => router.push("/properties/new/documents")}
      >
        Continue
      </Button>
    </div>
  );
}

/** Lazy-init `useState` (not an effect) so cleanup doesn't need a setState-in-effect. */
function ReviewImage({ file, count }: { file: File; count: number }) {
  const [url] = useState(() => URL.createObjectURL(file));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- transient blob: URL, next/image can't optimize these anyway. */}
      <img src={url} alt="" className="size-full object-cover" />
      <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
        1/{count}
      </span>
    </div>
  );
}

function ReviewRow({
  label,
  editHref,
  children,
}: {
  label: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <Link href={editHref} className="text-xs text-muted-foreground">
          Edit
        </Link>
      </div>
      <p className="rounded-xl bg-muted px-3 py-3 text-sm font-semibold">{children}</p>
    </div>
  );
}
