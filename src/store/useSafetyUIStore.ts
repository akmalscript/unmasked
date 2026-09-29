import { create } from "zustand";

export interface SafetyInterventionUI {
  riskLevel: "high" | "critical";
  category: string;
  supportiveResponse: string;
  saferNextStep: string;
  recommendedResourceIds: string[];
}

export type SafetyModalMode = "manual" | "intervention";

export interface SafetyUIState {
  isModalOpen: boolean;
  isCompanionVisible: boolean;
  modalMode: SafetyModalMode;
  intervention: SafetyInterventionUI | null;

  openIntervention: (intervention: SafetyInterventionUI) => void;
  openManualSupport: () => void;
  closeToCompanion: () => void;
  reopenIntervention: () => void;
  dismissCompanion: () => void;
}

/**
 * Store UI terpusat non-persistent untuk mengontrol modal keselamatan dan floating companion.
 * Tidak disimpan ke localStorage untuk menjaga privasi dan sifat transient intervensi aktif.
 */
export const useSafetyUIStore = create<SafetyUIState>((set) => ({
  isModalOpen: false,
  isCompanionVisible: false,
  modalMode: "manual",
  intervention: null,

  openIntervention: (intervention) =>
    set({
      isModalOpen: true,
      isCompanionVisible: false,
      modalMode: "intervention",
      intervention,
    }),

  openManualSupport: () =>
    set({
      isModalOpen: true,
      modalMode: "manual",
    }),

  closeToCompanion: () =>
    set((state) => ({
      isModalOpen: false,
      // Jika modal intervensi ditutup, tampilkan floating safety companion
      isCompanionVisible: state.modalMode === "intervention" ? true : state.isCompanionVisible,
    })),

  reopenIntervention: () =>
    set({
      isModalOpen: true,
      isCompanionVisible: false,
    }),

  dismissCompanion: () =>
    set({
      isCompanionVisible: false,
    }),
}));
