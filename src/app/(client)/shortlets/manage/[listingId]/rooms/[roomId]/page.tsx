import type { Metadata } from "next";
import { RoomCalendarContent } from "./room-calendar-content";

export const metadata: Metadata = { title: "Room Calendar" };

export default async function RoomCalendarPage({
  params,
}: {
  params: Promise<{ listingId: string; roomId: string }>;
}) {
  const { listingId, roomId } = await params;
  return <RoomCalendarContent listingId={Number(listingId)} roomId={Number(roomId)} />;
}
