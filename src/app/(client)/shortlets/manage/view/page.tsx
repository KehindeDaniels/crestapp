import type { Metadata } from "next";
import { Suspense } from "react";
import { ManageListingContent } from "./manage-listing-content";

export const metadata: Metadata = { title: "Manage Shortlet" };

/** `/shortlets/manage/view?id=1` — query-param based for static export. */
export default function ManageListingPage() {
  return (
    <Suspense>
      <ManageListingContent />
    </Suspense>
  );
}
