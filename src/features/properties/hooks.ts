import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import type { ID } from "@/types/api";
import type { PropertyPurpose } from "@/config/constants";
import { propertiesApi } from "./api";
import { toPropertyCardModel, toPropertyDetailModel } from "./models";
import type { CreatePropertyPayload, PropertySearchParams } from "./types";

/**
 * Returns view models (`PropertyCardModel[]`) plus pagination metadata —
 * components never touch `ApiProperty` directly. See models.ts.
 */
export function usePropertySearch(params: PropertySearchParams) {
  return useQuery({
    queryKey: queryKeys.properties.search(params),
    queryFn: async () => {
      const response = await propertiesApi.search(params);
      return {
        properties: response.data.properties.map(toPropertyCardModel),
        pagination: response.data.pagination,
      };
    },
  });
}

/**
 * A single property, for the Listing Detail page. There's no dedicated
 * `GET /properties/{id}` endpoint — per the confirmed search schema, a
 * single property is fetched via `properties/search` with an `id` filter,
 * but that returns a genuinely different response shape than the list
 * search (confirmed live — `data` is the property object directly, not
 * `{ properties: [...] }`), hence the separate `propertiesApi.get()`.
 */
export function usePropertyDetail(propertyId: number) {
  return useQuery({
    queryKey: queryKeys.properties.detail(propertyId),
    queryFn: async () => {
      const response = await propertiesApi.get(propertyId);
      return toPropertyDetailModel(response.data);
    },
  });
}

/**
 * Two real endpoints, not one with a `purpose` param — routes to
 * `/properties/rental` or `/properties/sale` based on `purpose`. Invalidates
 * the search cache on success so Home/Search pick up the new listing on
 * their next render instead of showing stale data.
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      purpose,
      ...payload
    }: CreatePropertyPayload & { purpose: PropertyPurpose }) =>
      purpose === "rent"
        ? propertiesApi.createRental(payload)
        : propertiesApi.createSale(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
  });
}

export function useUploadPropertyMedia() {
  return useMutation({
    mutationFn: ({ propertyId, formData }: { propertyId: ID; formData: FormData }) =>
      propertiesApi.uploadMedia(propertyId, formData),
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: (formData: FormData) => propertiesApi.uploadDocument(formData),
  });
}
