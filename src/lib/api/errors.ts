import type { FieldErrors } from "@/types/api";

/**
 * Normalized error surfaced to the whole app. `apiClient`/`publicFetch`
 * never leak raw fetch errors — everything becomes an ApiError.
 */
export class ApiError extends Error {
  readonly status: number;
  /** Backend `error_code` (e.g. "USER_BLOCKED"), when present. */
  readonly code?: string;
  /** Laravel 422 field-keyed messages, when present. */
  readonly fieldErrors?: FieldErrors;

  constructor(params: {
    status: number;
    message: string;
    code?: string;
    fieldErrors?: FieldErrors;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors;
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
    "Request failed";

  const fieldErrors =
    record.errors && typeof record.errors === "object"
      ? (record.errors as FieldErrors)
      : undefined;

  const code =
    typeof record.error_code === "string" ? record.error_code : undefined;

  return new ApiError({ status: response.status, message, code, fieldErrors });
}

/** Type guard for consumers. */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
