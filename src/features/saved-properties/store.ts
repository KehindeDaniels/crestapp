import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ID } from "@/types/api";

/**
 * Saved/favorited properties — genuinely client-only, backed by
 * `localStorage`. No backend endpoint exists for this at all (confirmed by
 * an exhaustive Postman search, more than once this session) — this is a
 * real, working feature, not a disabled stub, per explicit decision. Known
 * limitation, accepted: doesn't sync across devices/browsers, is lost if
 * site data is cleared, and (since it isn't namespaced per user) is shared
 * across accounts that log into the same browser. See
 * docs/design-vs-backend-gaps.md.
 */
interface SavedPropertiesState {
  ids: ID[];
  isSaved: (id: ID) => boolean;
  toggle: (id: ID) => void;
}

export const useSavedPropertiesStore = create<SavedPropertiesState>()(
  persist(
    (set, get) => ({
      ids: [],
      isSaved: (id) => get().ids.includes(id),
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((savedId) => savedId !== id)
            : [...state.ids, id],
        })),
    }),
    {
      name: "crest:saved-properties",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
