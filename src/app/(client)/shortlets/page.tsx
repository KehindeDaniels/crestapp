import type { Metadata } from "next";
import { ShortletSearchContent } from "./shortlet-search-content";

export const metadata: Metadata = { title: "Shortlets" };

export default function ShortletsPage() {
  return <ShortletSearchContent />;
}
