import type { FieldErrors } from "@/types/api";

/**
 * Normalized error surfaced to the whole app. `apiClient`/`publicFetch`
 * never leak raw fetch errors — everything becomes an ApiError.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Backend `error_code`/`error` (e.g. "USER_BLOCKED", "INVALID_TRANSACTION_STATE"), when present. */
  readonly code?: string;
  /** Laravel 422 field-keyed messages, when present. */
  readonly fieldErrors?: FieldErrors;
  /**
   * Raw response body beyond message/code/errors — some endpoints (contract
   * and transaction state-guards) return extra context like
   * `current_status`/`allowed_actions` that's worth surfacing rather than
   * discarding.
   */
  readonly details?: Record<string, unknown>;

  constructor(params: {
    status: number;
    message: string;
    code?: string;
    fieldErrors?: FieldErrors;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors;
    this.details = params.details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  get isForbidden(): boolean {
    return this.status === 403;
  }
  get isValidation(): boolean {
    return this.status === 422 || Boolean(this.fieldErrors);
  }
}

/** Build an ApiError from a non-OK Response, decoding both Laravel error shapes. */
export async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // non-JSON error body
  }

  const record = (body ?? {}) as Record<string, unknown>;
  const message =
    (typeof record.message === "string" && record.message) ||
    response.statusText ||
    `Request failed (HTTP ${response.status})`;

  const fieldErrors =
    record.errors && typeof record.errors === "object"
      ? (record.errors as FieldErrors)
      : undefined;

  const code: string | undefined =
    typeof record.error_code === "string"
      ? record.error_code
      : typeof record.error === "string"
        ? record.error
        : undefined;

  return new ApiError({
    status: response.status,
    message,
    code,
    fieldErrors,
    details: record,
  });
}

/** Type guard for consumers. */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

/**
 * The most useful human-readable message for an error. For Laravel 422s the
 * top-level `message` is a useless "Validation failed" — the real reason is in
 * the field-keyed `errors` (e.g. "The service fee bps field must not be greater
 * than 10000."). This surfaces those instead, falling back to `message`, then
 * to `fallback` for non-API errors.
 */
export function apiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isApiError(err)) {
    const fieldMessages = err.fieldErrors
      ? Object.values(err.fieldErrors).flat()
      : [];
    return fieldMessages.length > 0 ? fieldMessages.join(" ") : err.message;
  }
  return fallback;
}
