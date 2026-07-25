import type { Metadata } from "next";
import { ManageShortletsContent } from "./manage-shortlets-content";

export const metadata: Metadata = { title: "Manage Shortlets" };

export default function ManageShortletsPage() {
  return <ManageShortletsContent />;
}
