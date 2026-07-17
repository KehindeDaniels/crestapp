import { create } from "zustand";

/**
 * Narrower than the full `PropertyPurpose`/`PropertyType` enums — this
 * wizard only ever builds "sale"/"rent" listings for "apartment"/"land"
 * (the only two backend creation endpoints and the only two with a real
 * Figma design). See docs/design-vs-backend-gaps.md.
 */
export type ListablePurpose = "sale" | "rent";
export type ListablePropertyType = "apartment" | "land";

/**
 * Scratch state for the List Property wizard (Details -> Price/Location/Media
 * -> Review), mirroring `useRegisterWizardStore`'s shape: in-memory only (a
 * hard refresh restarts the wizard), each step page guards against being
 * opened directly without its prerequisite data.
 *
 * `images` holds real `File` objects (fine for an in-memory-only store) —
 * the Review step builds previews from them directly via
 * `URL.createObjectURL`, nothing is persisted or serialized.
 */
interface ListPropertyWizardState {
  purpose: ListablePurpose | null;
  propertyType: ListablePropertyType | null;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  description: string;
  title: string;
  price: number;
  locationAddress: string;
  city: string;
  state: string;
  images: File[];
  detailsComplete: boolean;
  mediaComplete: boolean;
  setDetails: (data: {
    purpose: ListablePurpose;
    propertyType: ListablePropertyType;
    bedrooms: number;
    bathrooms: number;
    squareMeters: number;
    description: string;
  }) => void;
  setMedia: (data: {
    title: string;
    price: number;
    locationAddress: string;
    city: string;
    state: string;
    images: File[];
  }) => void;
  reset: () => void;
}

const initialState = {
  purpose: null as ListablePurpose | null,
  propertyType: null as ListablePropertyType | null,
  bedrooms: 0,
  bathrooms: 0,
  squareMeters: 0,
  description: "",
  title: "",
  price: 0,
  locationAddress: "",
  city: "",
  state: "",
  images: [] as File[],
  detailsComplete: false,
  mediaComplete: false,
};

export const useListPropertyWizardStore = create<ListPropertyWizardState>((set) => ({
  ...initialState,
  setDetails: (data) => set({ ...data, detailsComplete: true }),
  setMedia: (data) => set({ ...data, mediaComplete: true }),
  reset: () => set(initialState),
}));
