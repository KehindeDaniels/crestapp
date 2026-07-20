"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedPropertiesStore } from "@/features/saved-properties";
import { usePropertyDetail, PropertySearchResultCard } from "@/features/properties";

/**
 * Built from real screenshots (docs/design/screenshots/saved/), not a live
 * Figma pull. Genuinely client-only — no backend endpoint exists for
 * favorites at all (confirmed by an exhaustive Postman search, more than
 * once this session); the heart toggles across the app write straight to
 * `useSavedPropertiesStore` (localStorage). See
 * docs/design-vs-backend-gaps.md for the accepted limitations (no
 * cross-device sync, shared across accounts on the same browser).
 */
export function SavedPropertiesContent() {
  const ids = useSavedPropertiesStore((s) => s.ids);

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-muted/30 px-6 py-20 text-center">
          <Image src="/noto_house.svg" alt="" width={92} height={92} />
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Save Property</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tap the heart icon on the property to add it to your favourites
            </p>
          </div>
          <Button asChild size="xl">
            <Link href="/search">Search Property</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <h1 className="text-xl font-bold sm:text-2xl">Saved Property</h1>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {ids.map((id) => (
          <SavedPropertyCard key={id} propertyId={id} />
        ))}
      </div>
    </div>
  );
}

function SavedPropertyCard({ propertyId }: { propertyId: number }) {
  const { data: property, isPending, isError } = usePropertyDetail(propertyId);

  if (isPending) {
    return (
      <div className="flex aspect-337/217 items-center justify-center rounded-2xl border bg-muted">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Property may have been removed since it was saved — skip it silently rather than erroring the whole grid.
  if (isError || !property) return null;

  return <PropertySearchResultCard property={property} />;
}
