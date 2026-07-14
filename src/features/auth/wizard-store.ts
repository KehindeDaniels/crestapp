import { create } from "zustand";
import type { UserRole } from "@/config/constants";

/**
 * Scratch state for the multi-step registration wizard (Account Creation —
 * personal info -> verify email -> phone -> verify phone -> role -> create
 * password).
 *
 * The role step has no dedicated Figma frame of its own — it's relocated
 * from the post-login "After Account Creation" screen's role picker, moved
 * here because `POST /api/auth/register` requires `role` and there is no
 * backend endpoint for a user to set their own role after registration (the
 * only role-update endpoint is admin-only). See
 * docs/design-vs-backend-gaps.md.
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
  role: UserRole | null;
  setPersonalInfo: (data: { firstName: string; lastName: string; email: string }) => void;
  markEmailVerified: () => void;
  setPhoneNumber: (phoneNumber: string) => void;
  markPhoneVerified: () => void;
  setRole: (role: UserRole) => void;
  reset: () => void;
}

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  emailVerified: false,
  phoneNumber: "",
  phoneVerified: false,
  role: null as UserRole | null,
};

export const useRegisterWizardStore = create<RegisterWizardState>((set) => ({
  ...initialState,
  setPersonalInfo: (data) =>
    set({ firstName: data.firstName, lastName: data.lastName, email: data.email }),
  markEmailVerified: () => set({ emailVerified: true }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  markPhoneVerified: () => set({ phoneVerified: true }),
  setRole: (role) => set({ role }),
  reset: () => set(initialState),
}));
