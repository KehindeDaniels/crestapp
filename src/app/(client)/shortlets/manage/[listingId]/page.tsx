import type { Metadata } from "next";
import { ManageListingContent } from "./manage-listing-content";

export const metadata: Metadata = { title: "Manage Shortlet" };

export default async function ManageListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  return <ManageListingContent listingId={Number(listingId)} />;
}
