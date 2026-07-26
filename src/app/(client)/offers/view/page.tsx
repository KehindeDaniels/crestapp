import type { Metadata } from "next";
import { Suspense } from "react";
import { OfferContent } from "./offer-content";

export const metadata: Metadata = { title: "Transaction Overview" };

/** `/offers/view?id=123` — query-param based for static export (see docs/deployment.md). */
export default function OfferPage() {
  return (
    <Suspense>
      <OfferContent />
    </Suspense>
  );
}
