import type { Metadata } from "next";
import { Suspense } from "react";
import { MyListingsContent } from "./my-listings-content";

export const metadata: Metadata = { title: "My Listing" };

export default function MyListingsPage() {
  return (
    <Suspense>
      <MyListingsContent />
    </Suspense>
  );
}
