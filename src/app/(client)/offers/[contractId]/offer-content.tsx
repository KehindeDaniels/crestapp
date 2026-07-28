"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  Circle,
  CreditCard,
  Landmark,
  MessageCircle,
  ShieldCheck,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { usePropertyDetail } from "@/features/properties";
import {
  useCancelOffer,
  useContractDetail,
  useOffer,
  useRegeneratePaymentLink,
} from "@/features/offers";

/**
 * Rebuilt against the real Figma node (1478-8110, file 8YqDLQnhJoIRLV1xEOXZcR)
 * after the first pass didn't match — this now mirrors its two-card layout
 * (image+Order Summary+Payment Methods on the left; Escrow banner+
 * Transaction Status+Expected Payouts+legal-review banner+Continue on the
 * right). See docs/design-vs-backend-gaps.md, Phase 11 for what still isn't
 * 1:1 with the design and why:
 * - Only Flutterwave is wired — the other 3 tiles are shown (matching the
 *   design) but disabled, since no other gateway has ever been returned by
 *   the confirmed `quick-create` response.
 * - "Transaction Status" uses real polled data (`GET /api/contracts/{id}`),
 *   not the design's exact 4-step "Legal Review in Progress" modal — the
 *   real `contract.status`/`transaction.status` enums only support 3
 *   honestly distinguishable stages (see `toContractStatusModel`).
 * - Brand icons for Bank Transfer/PayPal/Google Pay are generic lucide
 *   glyphs, not the real marks — those 3 tiles are disabled placeholders,
 *   not worth downloading/hosting real brand assets for.
 */
export function OfferContent({ contractId }: { contractId: number }) {
  const { data: offer } = useOffer(contractId);
  const { data: status, isPending, isError, error } = useContractDetail(contractId);
  const { data: property } = usePropertyDetail(status?.propertyId ?? 0);

  if (isPending) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (isError || !status) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-10 text-center">
        <p className="text-sm font-medium">Couldn&apos;t load this offer</p>
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <p className="text-sm text-muted-foreground">
          If you already completed payment, you can track its status in your History.
        </p>
        <Link href="/history" className="text-sm font-medium text-primary">
          Go to History
        </Link>
      </div>
    );
  }

  if (status.contractStatus === "cancelled") {
    return (
      <div className="mx-auto max-w-md space-y-4 p-10 text-center">
        <XCircle className="mx-auto size-8 text-destructive" />
        <p className="text-sm font-medium">This offer was cancelled</p>
        <Link href={`/properties/${status.propertyId}`} className="text-sm font-medium text-primary">
          Back to the property
        </Link>
      </div>
    );
  }

  const canPay = !status.isPaid && offer?.paymentLink;

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6 lg:p-10">
      <Link href={`/properties/${status.propertyId}`} className="flex items-center gap-1 text-xs text-muted-foreground">
        <ChevronLeft className="size-3.5" />
        Back
      </Link>

      <div className="space-y-1">
        <h1 className="text-base font-semibold">Transaction Overview</h1>
        <p className="text-xs text-muted-foreground">
          Review your offer and complete the payment to secure this property
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left card */}
        <div className="space-y-4 rounded-xl border border-primary/15 p-3">
          <div className="relative aspect-[524/340] w-full overflow-hidden rounded-md bg-muted">
            {property?.imageUrl && (
              <Image src={property.imageUrl} alt="" fill className="object-cover" />
            )}
          </div>

          <div className="rounded-xl bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Order Summary</h2>
              <Link
                href={`/messages?with=${status.ownerId}`}
                className="flex items-center gap-1 rounded-lg border border-primary px-3 py-1 text-xs font-medium text-primary"
              >
                <MessageCircle className="size-3.5" />
                Open Chat
              </Link>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <SummaryRow label="Property Price" value={status.propertyAmountFormatted} />
              <SummaryRow
                label={`Platform Fee (${status.platformFeePercentage}%)`}
                value={status.platformFeeFormatted}
              />
              <SummaryRow label={`Legal Fee (${status.legalFeePercentage}%)`} value={status.legalFeeFormatted} />
              <div className="border-t pt-2">
                <SummaryRow label="Total Payment" value={status.totalAmountFormatted} bold />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Payment Methods</p>
            <div className="flex flex-wrap gap-2 rounded-xl bg-muted/50 p-3">
              <PaymentTile icon={Zap} label="Flutterwave" active />
              <PaymentTile icon={Landmark} label="Bank Transfer" />
              <PaymentTile icon={CreditCard} label="PayPal" />
              <PaymentTile icon={Wallet} label="Google Pay" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-xl bg-primary p-4 text-primary-foreground">
            <div className="space-y-1">
              <p className="text-sm font-bold">Protected Payment (Escrow)</p>
              <p className="text-xs text-primary-foreground/80">
                Your money will be securely held with us and ONLY release to the owner after
                agreement is finalized
              </p>
            </div>
            <ShieldCheck className="size-8 shrink-0" />
          </div>

          <div className="space-y-2 rounded-xl border p-3">
            <p className="text-sm font-semibold">Transaction Status</p>
            <div className="flex flex-wrap gap-4">
              {status.stages.map((stage) => (
                <div key={stage.label} className="flex items-center gap-1.5 text-xs">
                  {stage.done ? (
                    <CheckCircle2 className="size-3.5 text-success" />
                  ) : (
                    <Circle
                      className={cn(
                        "size-3.5",
                        stage.active ? "text-primary" : "text-muted-foreground/40",
                      )}
                    />
                  )}
                  <span className={stage.done || stage.active ? "" : "text-muted-foreground"}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* "Expected Payouts / Owner Receives" panel removed — it was a
              frontend-calculated owner-side figure (not returned by the API,
              and inconsistent with the real fee model where the buyer pays
              property + fees). A buyer shouldn't see the owner's payout; the
              buyer's own costs are already in the Order Summary above. */}

          <div className="rounded-xl border border-success bg-success/8 p-3 text-sm">
            <span className="font-semibold text-success">Legal review</span>{" "}
            <span className="font-medium text-success">
              included for buyer and seller protection
            </span>
          </div>

          {status.isPaid ? (
            <Button asChild size="xl" className="w-full">
              <Link href={`/history?transaction=${status.transactionId}`}>
                Track Progress in History
              </Link>
            </Button>
          ) : canPay ? (
            <PayButton paymentLink={offer!.paymentLink} />
          ) : (
            <RegeneratePaymentLinkButton contractId={status.contractId} />
          )}

          {!status.isPaid && (
            <CancelOfferButton contractId={status.contractId} propertyId={status.propertyId} />
          )}
        </div>
      </div>
    </div>
  );
}

const REOPEN_COOLDOWN_MS = 2_000;

/**
 * Opens the (same, cached) payment link in a new tab. Reopening isn't a
 * data/financial risk — every click hits the identical Flutterwave
 * `payment_link`/`gateway_reference`, not a fresh `quick-create` call, so
 * there's no risk of duplicate contracts or double charges. It's still poor
 * UX to let rapid repeat clicks spawn tab after tab, so this relabels itself
 * to "Reopen" after the first click and briefly disables itself right after
 * each click — a debounce, not a one-time-use lock (closing the tab and
 * needing it again is the exact case this is meant to support).
 */
function PayButton({ paymentLink }: { paymentLink: string }) {
  const [hasOpened, setHasOpened] = useState(false);
  const [coolingDown, setCoolingDown] = useState(false);

  function handleClick() {
    window.open(paymentLink, "_blank", "noopener,noreferrer");
    setHasOpened(true);
    setCoolingDown(true);
    setTimeout(() => setCoolingDown(false), REOPEN_COOLDOWN_MS);
  }

  return (
    <div className="space-y-1 text-center">
      <Button type="button" size="xl" className="w-full" onClick={handleClick} disabled={coolingDown}>
        {hasOpened ? "Reopen Payment Page" : "Continue"}
      </Button>
      <p className="text-xs text-muted-foreground">
        {hasOpened
          ? "Opened in a new tab — click again if you closed it by mistake."
          : "Opens in a new tab — this page stays open, so you can come back here if you close it."}
      </p>
    </div>
  );
}

/**
 * `POST /api/contracts/{id}/payment/generate-link` — real endpoint, zero
 * confirmed response shape (see `useRegeneratePaymentLink`). Shown when the
 * original one-time link isn't in this browser's cache anymore (closed
 * checkout tab AND reloaded/reopened this page, or opened on another
 * device) — the actual recovery path the user asked for.
 */
function RegeneratePaymentLinkButton({ contractId }: { contractId: number }) {
  const regenerate = useRegeneratePaymentLink(contractId);

  return (
    <div className="space-y-1 text-center">
      <Button
        type="button"
        size="xl"
        className="w-full"
        disabled={regenerate.isPending}
        onClick={() =>
          regenerate.mutate(undefined, {
            onSuccess: (response) => {
              const link = response.data?.payment_link;
              if (link) window.open(link, "_blank", "noopener,noreferrer");
            },
          })
        }
      >
        {regenerate.isPending ? "Getting a new link…" : "Get a new payment link"}
      </Button>
      {regenerate.isSuccess && !regenerate.data?.data?.payment_link && (
        <p className="text-xs text-destructive">
          Couldn&apos;t get a new link — try again, or check{" "}
          <Link href="/history" className="font-medium text-primary">
            History
          </Link>{" "}
          for this transaction&apos;s status.
        </p>
      )}
      {regenerate.isError && (
        <p className="text-xs text-destructive">Couldn&apos;t get a new link — try again.</p>
      )}
    </div>
  );
}

/** `POST /api/contracts/{id}/cancel` — confirmed real endpoint. Only offered pre-payment; once paid, cancelling is a real refund/escrow decision, not a plain contract cancel. */
function CancelOfferButton({ contractId, propertyId }: { contractId: number; propertyId: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const cancelOffer = useCancelOffer(contractId, propertyId);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto block text-xs font-medium text-muted-foreground underline"
      >
        Cancel this offer
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this offer?</DialogTitle>
            <DialogDescription>
              This cancels the contract for good — the owner will be notified.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            rows={3}
            className="w-full rounded-lg border bg-muted p-3 text-sm outline-none focus-visible:border-ring"
          />
          {cancelOffer.isError && (
            <p className="text-sm text-destructive">Couldn&apos;t cancel this offer — try again.</p>
          )}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={cancelOffer.isPending}
              onClick={() =>
                cancelOffer.mutate(reason.trim() || "Buyer cancelled", {
                  onSuccess: () => setOpen(false),
                })
              }
            >
              {cancelOffer.isPending ? "Cancelling…" : "Yes, cancel offer"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Keep offer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", bold && "font-semibold")}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function PaymentTile({
  icon: Icon,
  label,
  active,
}: {
  icon: typeof Zap;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-medium",
        active
          ? "border-2 border-primary bg-white text-foreground"
          : "cursor-not-allowed bg-black/[0.06] text-muted-foreground/60",
      )}
      title={active ? undefined : "Not available yet — only Flutterwave is confirmed"}
    >
      <Icon className="size-4" />
      {label}
    </div>
  );
}
