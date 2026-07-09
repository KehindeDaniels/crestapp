/** Cross-cutting API types shared across features. */

export type ID = number;

/** Laravel paginator envelope (as returned by list endpoints). */
export interface Paginated<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}

/** Common success wrapper used by many endpoints: { success, message, data }. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Field-keyed validation errors from Laravel 422 responses. */
export type FieldErrors = Record<string, string[]>;
