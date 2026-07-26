import type { Metadata } from "next";
import { Suspense } from "react";
import { ShortletDetailContent } from "./shortlet-detail-content";

export const metadata: Metadata = { title: "Shortlet" };

/** `/shortlets/view?id=1&check_in=…&nights=…` — query-param based for static export. */
export default function ShortletDetailPage() {
  return (
    <Suspense>
      <ShortletDetailContent />
    </Suspense>
  );
}
