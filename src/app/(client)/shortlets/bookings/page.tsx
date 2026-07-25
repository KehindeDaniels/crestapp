import type { Metadata } from "next";
import { MyBookingsContent } from "./my-bookings-content";

export const metadata: Metadata = { title: "My Bookings" };

export default function MyBookingsPage() {
  return <MyBookingsContent />;
}
