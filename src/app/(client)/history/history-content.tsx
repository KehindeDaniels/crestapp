"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { Pagination } from "@/features/properties";
import { useTransactions, type TransactionBucket } from "@/features/transactions";
import { TransactionDetailModal } from "./transaction-detail-modal";

const TABS: { value: TransactionBucket | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In-Progress" },
  { value: "cancelled", label: "Cancelled" },
];

/**
 * Built from real screenshots (docs/design/screenshots/history/), not a
 * live Figma pull. `GET /api/transactions` is real and confirmed (full
 * saved example response) but only accepts ONE exact `status` value, not a
 * bucket — "Completed"/"Cancelled" tabs map directly to a real `status`
 * filter, but "In-Progress" covers 6 different real statuses at once
 * (initiated/pending_payment/payment_received/in_escrow/disputed/refunded)
 * with no single value for it. For that tab (and the search box, which has
 * no confirmed backend param at all), filtering happens client-side on
 * whatever page is already fetched — a known simplification: the visible
 * row count for "In-Progress" or an active search may be less than
 * `per_page` even when more matches exist on other pages. See
 * docs/design-vs-backend-gaps.md, Phase 10.
 */
export function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as TransactionBucket | "all" | null) ?? "all";
  const page = Number(searchParams.get("page") ?? "1");
  const [query, setQuery] = useState("");
  // Lazy init from `?transaction=` — lets the post-payment offer flow deep-link
  // straight into a transaction's detail modal instead of just landing on the list.
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const fromQuery = searchParams.get("transaction");
    return fromQuery ? Number(fromQuery) : null;
  });

  const { data, isPending, isError } = useTransactions({
    status: tab === "completed" || tab === "cancelled" ? tab : undefined,
    page,
    per_page: 10,
  });

  const visibleTransactions = useMemo(() => {
    if (!data) return [];
    let list = data.transactions;
    if (tab === "in_progress") list = list.filter((t) => t.bucket === "in_progress");
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((t) => t.propertyTitle.toLowerCase().includes(q));
    }
    return list;
  }, [data, tab, query]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    if (key !== "page") params.set("page", "1");
    router.push(`/history?${params.toString()}`);
  }

  const hasAnyTransactions = (data?.summary.total_transactions ?? 0) > 0;

  if (!isPending && !hasAnyTransactions) {
    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-10">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 rounded-3xl border border-[rgba(102,102,102,0.16)] bg-[rgba(244,248,255,0.54)] px-6 py-16 text-center">
          <Image
            src="/history_folder.svg"
            alt=""
            width={307}
            height={148}
            className="h-auto w-56 sm:w-64 md:w-72"
          />
          <div className="flex max-w-xl flex-col items-center gap-4">
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">No activities yet</h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              When you buy or rent a property, your transactions will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">History</h1>
        <p className="text-sm text-muted-foreground">
          A completed timeline for all property transactions and the prices updates
        </p>
      </div>

      <div className="rounded-2xl border">
        <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-4">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setParam("tab", t.value)}
                className={cn(
                  "border-b-2 pb-1 text-sm font-medium",
                  tab === t.value
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search property"
              className="bg-muted pl-9"
            />
          </div>
        </div>

        {isPending && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <p className="p-6 text-sm text-destructive">Couldn&apos;t load your history right now.</p>
        )}

        {!isPending && visibleTransactions.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No transactions match these filters.
          </p>
        )}

        {visibleTransactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">S/N</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((transaction, i) => (
                  <tr key={transaction.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{transaction.propertyTitle}</td>
                    <td className="px-4 py-3">{transaction.typeLabel}</td>
                    <td className="px-4 py-3">{transaction.amountFormatted}</td>
                    <td className="px-4 py-3 capitalize">{transaction.status.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(transaction.id)}
                        className="text-sm font-medium text-primary underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pagination.lastPage > 1 && (
          <div className="border-t p-4">
            <Pagination
              currentPage={data.pagination.currentPage}
              lastPage={data.pagination.lastPage}
              onPageChange={(p) => setParam("page", String(p))}
            />
          </div>
        )}
      </div>

      <TransactionDetailModal
        transactionId={selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  );
}
