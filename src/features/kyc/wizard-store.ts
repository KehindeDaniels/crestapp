import { create } from "zustand";
import type { KycDocumentType } from "./types";

/**
 * Scratch state for the KYC submission wizard (Figma: KYC — intro -> upload ID
 * front/back -> selfie -> processing/submitted). In-memory only, same
 * trade-off as the register wizard: a hard refresh restarts the flow.
 */
interface KycWizardState {
  documentType: KycDocumentType;
  documentNumber: string;
  frontFileUrl: string;
  frontFileName: string;
  backFileUrl: string;
  backFileName: string;
  selfieFileUrl: string;
  setIdDocument: (data: {
    documentType: KycDocumentType;
    documentNumber: string;
    frontFileUrl: string;
    frontFileName: string;
    backFileUrl: string;
    backFileName: string;
  }) => void;
  setSelfie: (selfieFileUrl: string) => void;
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
  reset: () => set(initialState),
}));
