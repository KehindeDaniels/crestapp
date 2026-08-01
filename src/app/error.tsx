"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(observability): report to Sentry once wired up.
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground max-w-sm">
        An unexpected error occurred. You can try again.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground mt-2 rounded-lg px-4 py-2 text-sm font-medium"
      >
        Try again
      </button>

      {/* Temporary diagnostic — surfaces the real error so it can be seen/
          screenshotted without DevTools. Remove once the recurring crash is
          fixed. Note: Next.js digests SERVER errors in production (message
          becomes generic + a `digest` id); client render errors keep their
          real message. */}
      {(error?.message || error?.digest) && (
        <details className="mt-4 max-w-md text-left">
          <summary className="text-muted-foreground cursor-pointer text-xs">
            Error details
          </summary>
          <pre className="text-muted-foreground/80 mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-left text-[11px] whitespace-pre-wrap break-words">
            {error?.message}
            {error?.digest ? `\n\ndigest: ${error.digest}` : ""}
          </pre>
        </details>
      )}
    </main>
  );
}
