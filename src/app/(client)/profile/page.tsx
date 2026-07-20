import type { Metadata } from "next";
import { ProfileContent } from "./profile-content";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return <ProfileContent />;
}
