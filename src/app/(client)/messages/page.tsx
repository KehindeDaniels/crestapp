import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesContent } from "./messages-content";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <Suspense>
      <MessagesContent />
    </Suspense>
  );
}
