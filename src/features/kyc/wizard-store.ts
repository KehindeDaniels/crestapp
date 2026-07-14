import { create } from "zustand";
import type { KycDocumentType } from "./types";

export type KycSubmissionStatus = "idle" | "submitting" | "success" | "error";

/**
 * Scratch state for the KYC submission wizard (Figma: KYC — intro -> upload ID
 * front/back -> selfie -> processing/submitted). In-memory only, same
 * trade-off as the register wizard: a hard refresh restarts the flow.
 *
 * `submissionStatus`/`submissionError` deliberately live here rather than in
 * `kyc/processing/page.tsx`'s local `useSubmitKyc()` mutation state. A live
 * test showed the processing page's component instance getting unmounted
 * while its submit request was still in flight (several possible triggers —
 * `AuthGuard` re-evaluating on a background `/api/user` refetch, a stray
 * remount — see docs/design-vs-backend-gaps.md, Phase 3), so the request
 * would complete on the network with nothing left mounted to render its
 * outcome. Writing the result here, from the mutation's own `.then()`/
 * `.catch()` (not from React-rendered `isSuccess`/`isError`), means the
 * outcome survives regardless of which component instance is mounted when it
 * resolves — a fresh mount just reads whatever's already in the store.
 */
interface KycWizardState {
  documentType: KycDocumentType;
  documentNumber: string;
  frontFileUrl: string;
  frontFileName: string;
  backFileUrl: string;
  backFileName: string;
  selfieFileUrl: string;
  submissionStatus: KycSubmissionStatus;
  submissionError: string | null;
  setIdDocument: (data: {
    documentType: KycDocumentType;
    documentNumber: string;
    frontFileUrl: string;
    frontFileName: string;
    backFileUrl: string;
    backFileName: string;
  }) => void;
  setSelfie: (selfieFileUrl: string) => void;
  startSubmission: () => void;
  markSubmissionSuccess: () => void;
  markSubmissionError: (message: string) => void;
  reset: () => void;
}

const initialState = {
  documentType: "national_id" as KycDocumentType,
  documentNumber: "",
  frontFileUrl: "",
  frontFileName: "",
  backFileUrl: "",
  backFileName: "",
  selfieFileUrl: "",
  submissionStatus: "idle" as KycSubmissionStatus,
  submissionError: null as string | null,
};

export const useKycWizardStore = create<KycWizardState>((set) => ({
  ...initialState,
  setIdDocument: (data) =>
    set({
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      frontFileUrl: data.frontFileUrl,
      frontFileName: data.frontFileName,
      backFileUrl: data.backFileUrl,
      backFileName: data.backFileName,
    }),
  setSelfie: (selfieFileUrl) => set({ selfieFileUrl }),
  startSubmission: () => set({ submissionStatus: "submitting", submissionError: null }),
  markSubmissionSuccess: () => set({ submissionStatus: "success", submissionError: null }),
  markSubmissionError: (message) =>
    set({ submissionStatus: "error", submissionError: message }),
  reset: () => set(initialState),
}));
