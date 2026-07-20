import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { ID } from "@/types/api";
import { offersApi } from "./api";
import {
  toContractStatusModel,
  toExistingOfferSummary,
  toOfferModel,
  toPaymentLinkInfo,
  type PaymentLinkInfo,
} from "./models";

/**
 * Seeds `queryKeys.contracts.paymentSession(contractId)` with just the
 * one-time payment link info (not the full `OfferModel`) on success — kept
 * in a key distinct from `queryKeys.contracts.detail`, which
 * `useContractDetail` below actually re-fetches from a real endpoint. The
 * two must never share a key: one is a cache-only snapshot, the other is a
 * live polled query, and conflating them was exactly the kind of bug already
 * caught once this session (Notifications, Phase 9).
 */
export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: ID) => offersApi.quickCreate(propertyId),
    onSuccess: (response) => {
      const offer = toOfferModel(response.data);
      queryClient.setQueryData(
        queryKeys.contracts.paymentSession(offer.contractId),
        toPaymentLinkInfo(offer),
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.forProperty(offer.propertyId) });
    },
  });
}

/**
 * Reads the one-time payment link cached by `useCreateOffer` (or refreshed
 * by `useRegeneratePaymentLink`) — never fetches on its own, since no
 * confirmed endpoint returns it outside those two paths. A cache miss
 * resolves to `undefined`; everything else `/offers/[contractId]` needs
 * comes from `useContractDetail` below instead.
 */
export function useOffer(contractId: ID) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.contracts.paymentSession(contractId),
    queryFn: () => queryClient.getQueryData<PaymentLinkInfo>(queryKeys.contracts.paymentSession(contractId)),
    enabled: false,
    initialData: () => queryClient.getQueryData<PaymentLinkInfo>(queryKeys.contracts.paymentSession(contractId)),
    staleTime: Infinity,
  });
}

const ACTIVE_POLL_MS = 8_000;

/**
 * Real, re-fetchable contract status — `GET /api/contracts/{id}`. Polls
 * while the contract hasn't reached a terminal state yet (matches this
 * app's established "fake real-time via polling" pattern), and stops once
 * it has, rather than polling forever.
 */
export function useContractDetail(contractId: ID | null) {
  return useQuery({
    queryKey: queryKeys.contracts.detail(contractId ?? 0),
    queryFn: async () => {
      const response = await offersApi.getContract(contractId!);
      return toContractStatusModel(response.data);
    },
    enabled: contractId != null,
    refetchInterval: (query) => (query.state.data?.isTerminal ? false : ACTIVE_POLL_MS),
  });
}

/**
 * Checks whether the current user already has a contract for this property
 * before showing "Make Offer" — `quick-create` performs no duplicate check
 * of its own, so skipping this would let a second real, binding contract be
 * created against the same listing.
 */
export function useExistingOfferForProperty(propertyId: ID | null) {
  return useQuery({
    queryKey: queryKeys.contracts.forProperty(propertyId ?? 0),
    queryFn: async () => {
      const response = await offersApi.listForProperty(propertyId!);
      return toExistingOfferSummary(response.data);
    },
    enabled: propertyId != null,
  });
}

/**
 * `POST /api/contracts/{id}/cancel` — confirmed real endpoint, answers "can
 * I cancel an offer?". Also invalidates `transactions.all` — History's list
 * lives on a completely separate query and was never told to refetch after
 * a cancel, so it kept showing stale data regardless of what the backend
 * actually did with the linked transaction's status.
 */
export function useCancelOffer(contractId: ID, propertyId?: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => offersApi.cancel(contractId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.detail(contractId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      if (propertyId != null) {
        queryClient.invalidateQueries({ queryKey: queryKeys.contracts.forProperty(propertyId) });
      }
    },
  });
}

/**
 * `POST /api/contracts/{id}/payment/generate-link` — real endpoint, zero
 * confirmed response shape. Only writes to the payment-session cache if the
 * response actually contains a `payment_link` string; the mutation can
 * "succeed" over the wire while still returning nothing usable, so the
 * caller should check for that rather than assume a link now exists.
 */
export function useRegeneratePaymentLink(contractId: ID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => offersApi.regeneratePaymentLink(contractId),
    onSuccess: (response) => {
      const link = response.data?.payment_link;
      if (!link) return;
      const info: PaymentLinkInfo = {
        paymentLink: link,
        paymentGateway: response.data?.payment_details?.gateway ?? "flutterwave",
        paymentExpiresAt: response.data?.payment_details?.expires_at ?? "",
      };
      queryClient.setQueryData(queryKeys.contracts.paymentSession(contractId), info);
    },
  });
}
