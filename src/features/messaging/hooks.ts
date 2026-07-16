import { useMutation } from "@tanstack/react-query";
import { messagingApi } from "./api";
import type { SendMessagePayload } from "./types";

/** No inbox/thread UI exists yet to view the conversation afterward — the send itself is real, per explicit decision (docs/design-vs-backend-gaps.md). */
export function useSendMessage() {
  return useMutation({
    mutationFn: (payload: SendMessagePayload) => messagingApi.send(payload),
  });
}
