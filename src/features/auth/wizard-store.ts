import { create } from "zustand";

/**
 * Scratch state for the multi-step registration wizard (Figma: Account Creation —
 * personal info -> verify email -> phone -> verify phone -> create password).
 *
 * In-memory only (no persistence middleware): a hard refresh restarts the
 * wizard. Acceptable for now, kept intentionally simple. Each step page also
 * guards against being opened directly without its prerequisite data.
 */
interface RegisterWizardState {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  setPersonalInfo: (data: { firstName: string; lastName: string; email: string }) => void;
  markEmailVerified: () => void;
  setPhoneNumber: (phoneNumber: string) => void;
  markPhoneVerified: () => void;
  reset: () => void;
}

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  emailVerified: false,
  phoneNumber: "",
  phoneVerified: false,
};

export const useRegisterWizardStore = create<RegisterWizardState>((set) => ({
  ...initialState,
  setPersonalInfo: (data) =>
    set({ firstName: data.firstName, lastName: data.lastName, email: data.email }),
  markEmailVerified: () => set({ emailVerified: true }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  markPhoneVerified: () => set({ phoneVerified: true }),
  reset: () => set(initialState),
}));
