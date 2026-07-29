import { env } from "@/config/env";

/**
 * Backend media paths (e.g. `media_url: "/storage/property_media/..."`) are
 * relative to the API origin and need it prefixed. Already-absolute URLs
 * (e.g. owner avatars) must be left untouched. Shared by properties and
 * shortlets — both render the same property `media[]` shape.
 */
export function toAbsoluteMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const origin = new URL(env.NEXT_PUBLIC_API_URL).origin;
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
