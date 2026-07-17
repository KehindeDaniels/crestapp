import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Numbered pages with an ellipsis for large ranges, matching the Figma
 * reference (`1 2 3 4 5 6 7 … 18`). Kept simple: always shows the first 7
 * pages, then an ellipsis + the last page if there are more — the Figma
 * screenshot only shows this one truncation shape, no "ellipsis in the
 * middle around the current page" variant was in the design to confirm
 * against.
 *
 * Up to 10 fixed-size buttons in one row overflows any mobile viewport, so
 * below `sm` this collapses to prev/next + a "Page X of Y" label instead of
 * the full numbered row.
 */
export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  const visiblePages = lastPage <= 7 ? range(1, lastPage) : range(1, 7);
  const showTrailingEllipsis = lastPage > 7;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
      </button>

      <span className="text-sm font-medium sm:hidden">
        Page {currentPage} of {lastPage}
      </span>

      <div className="hidden items-center gap-2 sm:flex">
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-sm font-medium",
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted",
            )}
          >
            {page}
          </button>
        ))}

        {showTrailingEllipsis && (
          <>
            <span className="px-1 text-muted-foreground">…</span>
            <button
              type="button"
              onClick={() => onPageChange(lastPage)}
              aria-current={lastPage === currentPage ? "page" : undefined}
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-medium",
                lastPage === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {lastPage}
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= lastPage}
        aria-label="Next page"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border disabled:opacity-40"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
