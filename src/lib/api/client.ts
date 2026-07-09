import { env } from "@/config/env";
import { getToken, clearSession } from "@/lib/auth/token";
import { ApiError, toApiError } from "./errors";

const BASE_URL = env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 20_000;

type Json = Record<string, unknown> | unknown[];

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON body (auto-serialized) or FormData/BodyInit for uploads. */
  body?: Json | BodyInit | null;
  /** Milliseconds before the request is aborted. */
  timeoutMs?: number;
  /** Next.js fetch caching options — only meaningful for `publicFetch`. */
  next?: { revalidate?: number | false; tags?: string[] };
}

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
}

function isPlainJsonBody(body: unknown): body is Json {
  return (
    body != null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams)
  );
}

async function request<T>(
  path: string,
  {
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    next,
    headers,
    ...init
  }: RequestOptions,
  token: string | null,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (isPlainJsonBody(body)) {
    finalHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  } else if (body != null) {
    payload = body as BodyInit; // FormData etc. — let the browser set the boundary
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...init,
      headers: finalHeaders,
      body: payload,
      signal: controller.signal,
      ...(next ? { next } : {}),
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError({ status: 408, message: "Request timed out" });
    }
    throw new ApiError({
      status: 0,
      message: "Network error. Check your connection.",
    });
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const apiError = await toApiError(response);
    // Client-stored session expired/invalid → drop it so guards can react.
    if (apiError.isUnauthorized && typeof window !== "undefined") {
      clearSession();
    }
    throw apiError;
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Authenticated client for browser calls to Laravel. Attaches the bearer token
 * from the client-stored session. Do NOT call from Server Components.
 */
export function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return request<T>(path, options, getToken());
}

/**
 * Server-safe fetch for PUBLIC (unauthenticated) endpoints only. Never attaches a
 * token, so it is safe in Server Components. Supports Next fetch caching via `next`.
 */
export function publicFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  return request<T>(path, options, null);
}
