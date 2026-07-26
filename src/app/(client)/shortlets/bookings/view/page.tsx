import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingDetailContent } from "./booking-detail-content";

export const metadata: Metadata = { title: "Booking" };

/** `/shortlets/bookings/view?id=101` — query-param based for static export. */
export default function BookingDetailPage() {
  return (
    <Suspense>
      <BookingDetailContent />
    </Suspense>
  );
}
