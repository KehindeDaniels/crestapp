import type { Metadata } from "next";
import { SavedPropertiesContent } from "./saved-properties-content";

export const metadata: Metadata = { title: "Saved Property" };

export default function SavedPropertiesPage() {
  return <SavedPropertiesContent />;
}
