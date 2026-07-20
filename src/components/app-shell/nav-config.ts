import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  History,
  LayoutGrid,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * Screens without a real destination yet render disabled (per Figma, but
   * non-clickable) rather than linking to a 404 — same
   * "visible but not wired" treatment as the Property Feature filter, not a
   * new pattern invented for nav. Flip to `true` as each screen ships.
   */
  enabled: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: LayoutGrid, enabled: true },
  { label: "Search Property", href: "/search", icon: Search, enabled: true },
  { label: "List Property", href: "/properties/new", icon: PlusSquare, enabled: true },
  { label: "Messages", href: "/messages", icon: MessageCircle, enabled: true },
  { label: "History", href: "/history", icon: History, enabled: false },
  { label: "Saved Property", href: "/saved", icon: Bookmark, enabled: true },
  { label: "Profile", href: "/profile", icon: User, enabled: false },
];

export const LOG_OUT_ICON = LogOut;
