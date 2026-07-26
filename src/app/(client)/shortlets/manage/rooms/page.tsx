import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomCalendarContent } from "./room-calendar-content";

export const metadata: Metadata = { title: "Room Calendar" };

/** `/shortlets/manage/rooms?listing=1&room=1` — query-param based for static export. */
export default function RoomCalendarPage() {
  return (
    <Suspense>
      <RoomCalendarContent />
    </Suspense>
  );
}
