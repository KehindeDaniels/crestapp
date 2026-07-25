import type { Metadata } from "next";
import { BookingDetailContent } from "./booking-detail-content";

export const metadata: Metadata = { title: "Booking" };

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingDetailContent bookingId={Number(bookingId)} />;
}
