import type { Metadata } from "next";
import { Suspense } from "react";
import { ShortletDetailContent } from "./shortlet-detail-content";

export const metadata: Metadata = { title: "Shortlet" };

export default async function ShortletDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  return (
    <Suspense>
      <ShortletDetailContent listingId={Number(listingId)} />
    </Suspense>
  );
}
