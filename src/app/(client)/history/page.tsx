import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryContent } from "./history-content";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <Suspense>
      <HistoryContent />
    </Suspense>
  );
}
