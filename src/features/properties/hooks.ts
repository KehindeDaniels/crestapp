import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { propertiesApi } from "./api";
import { toPropertyCardModel } from "./models";
import type { PropertySearchParams } from "./types";

/**
 * Returns view models (`PropertyCardModel[]`), never the raw API shape —
 * components never touch `ApiProperty` directly. See models.ts.
 */
export function usePropertySearch(params: PropertySearchParams) {
  return useQuery({
    queryKey: queryKeys.properties.search(params),
    queryFn: async () => {
      const response = await propertiesApi.search(params);
      return response.data.properties.map(toPropertyCardModel);
    },
  });
}
