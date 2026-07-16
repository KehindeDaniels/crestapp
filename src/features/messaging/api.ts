import { apiClient } from "@/lib/api/client";
import type { SendMessagePayload, SendMessageResponse } from "./types";

export const messagingApi = {
  send: (payload: SendMessagePayload) =>
    apiClient<SendMessageResponse>("/api/communication/messages/send", {
      method: "POST",
      body: payload,
    }),
};
