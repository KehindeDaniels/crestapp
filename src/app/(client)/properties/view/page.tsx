import { Suspense } from "react";
import { ListingDetailContent } from "./listing-detail-content";

/**
 * Property detail — `/properties/view?id=123`. Query-param based (not a
 * dynamic `[id]` segment) so it works under static export, where params for
 * unknown ids can't be pre-rendered. See docs/deployment.md.
 */
export default function ListingDetailPage() {
  return (
    <Suspense>
      <ListingDetailContent />
    </Suspense>
  );
}
