import {
  AUTH_COOKIE,
  ROLE_COOKIE,
  STATUS_COOKIE,
  type UserRole,
  type UserStatus,
} from "@/config/constants";

/**
 * Client-side session token storage.
 *
 * Per the frontend blueprint (§6), the Sanctum bearer token is stored client-side
 * in a JS-readable cookie so the browser can attach it to direct Laravel calls and
 * `proxy.ts` can do optimistic redirects. This is an accepted XSS trade-off, isolated
 * to this module so a future move to an httpOnly BFF touches only here + apiClient.
 */

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days (matches token expires_in)

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function getToken(): string | null {
  return readCookie(AUTH_COOKIE);
}

export interface SessionSnapshot {
  token: string;
  role: UserRole;
  status: UserStatus;
}

export function persistSession({ token, role, status }: SessionSnapshot): void {
  writeCookie(AUTH_COOKIE, token);
  writeCookie(ROLE_COOKIE, role);
  writeCookie(STATUS_COOKIE, status);
}

export function clearSession(): void {
  deleteCookie(AUTH_COOKIE);
  deleteCookie(ROLE_COOKIE);
  deleteCookie(STATUS_COOKIE);
}
