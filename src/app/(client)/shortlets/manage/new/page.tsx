import type { Metadata } from "next";
import { CreateShortletContent } from "./create-shortlet-content";

export const metadata: Metadata = { title: "Add Shortlet" };

export default function CreateShortletPage() {
  return <CreateShortletContent />;
}
