import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { propertiesApi } from "./api";
import { toPropertyCardModel, toPropertyDetailModel } from "./models";
import type { PropertySearchParams } from "./types";

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
