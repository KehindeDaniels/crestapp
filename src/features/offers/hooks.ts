import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { ID } from "@/types/api";
import { offersApi } from "./api";
import { toOfferModel, type OfferModel } from "./models";

/**
 * Seeds `queryKeys.contracts.detail(contractId)` with the mapped model on
 * success so the new `/offers/[contractId]` route can render instantly
 * without a second request — there is no confirmed `GET` that returns the
 * one-time `payment_link` again, so this cached copy IS the only place it
 * lives after this call resolves.
 */
export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: ID) => offersApi.quickCreate(propertyId),
    onSuccess: (response) => {
      const offer = toOfferModel(response.data);
      queryClient.setQueryData(queryKeys.contracts.detail(offer.contractId), offer);
    },
  });
}

/**
 * Reads the offer cached by `useCreateOffer` above — never fetches on its
 * own (no confirmed endpoint returns this shape, `payment_link` especially).
 * A cache miss (fresh page load / link shared elsewhere) resolves to
 * `undefined`, which the offer page treats as an expired/unavailable session.
 */
export function useOffer(contractId: ID) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.contracts.detail(contractId),
    queryFn: () => queryClient.getQueryData<OfferModel>(queryKeys.contracts.detail(contractId)),
    enabled: false,
    initialData: () => queryClient.getQueryData<OfferModel>(queryKeys.contracts.detail(contractId)),
    staleTime: Infinity,
  });
}
