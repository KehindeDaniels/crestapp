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
    </main>
  );
}
