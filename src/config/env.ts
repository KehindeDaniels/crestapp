import { z } from "zod";

/**
 * Validated, typed environment. Only NEXT_PUBLIC_* vars reach the client
 * (runtime-config APIs were removed in Next 16). Fails fast at import time
 * if a required variable is missing or malformed.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url({
    error: "NEXT_PUBLIC_API_URL must be a valid URL",
  }),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

// Reference each var explicitly — Next inlines NEXT_PUBLIC_* only when statically referenced.
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;
