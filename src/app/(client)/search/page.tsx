import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchContent } from "./search-content";

export const metadata: Metadata = { title: "Search Property" };

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
