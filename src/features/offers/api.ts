import { apiClient } from "@/lib/api/client";
import type { ID } from "@/types/api";
import type { QuickCreateResponse } from "./types";

export const offersApi = {
  quickCreate: (propertyId: ID) =>
    apiClient<QuickCreateResponse>("/api/contracts/quick-create", {
      method: "POST",
      body: { property_id: propertyId },
    }),
};
