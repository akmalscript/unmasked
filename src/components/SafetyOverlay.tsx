"use client";

import React from "react";
import { useSafetyUIStore } from "@/store/useSafetyUIStore";
import { CrisisModal } from "@/components/CrisisModal";
import { SafetyCompanion } from "@/components/SafetyCompanion";

/**
 * Global Safety Overlay according to UNMASKED Safety v2 Specification.
 *
 * Dipasang sekali pada root layout untuk mengontrol kehadiran CrisisModal dan
 * Floating Safety Companion secara terpusat tanpa duplikasi state pada tiap page/section.
 */
export function SafetyOverlay() {
  const isModalOpen = useSafetyUIStore((state) => state.isModalOpen);
  const modalMode = useSafetyUIStore((state) => state.modalMode);
  const intervention = useSafetyUIStore((state) => state.intervention);
  const closeToCompanion = useSafetyUIStore((state) => state.closeToCompanion);

  return (
    <>
      <CrisisModal
        isOpen={isModalOpen}
        onClose={closeToCompanion}
        mode={modalMode}
        intervention={intervention}
      />
      <SafetyCompanion />
    </>
  );
}
