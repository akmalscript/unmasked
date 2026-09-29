"use client";

import React from "react";
import { useSafetyUIStore } from "@/store/useSafetyUIStore";

/**
 * Floating Safety Companion Widget according to UNMASKED Safety v2 Specification.
 *
 * Komponen ini muncul secara halus di sudut layar setelah pengguna menutup modal intervensi,
 * memberikan akses instan kembali ke sumber bantuan tanpa bersikap menghakimi atau mengganggu
 * navigasi jurnal pengguna.
 */
export function SafetyCompanion() {
  const isCompanionVisible = useSafetyUIStore((state) => state.isCompanionVisible);
  const isModalOpen = useSafetyUIStore((state) => state.isModalOpen);
  const reopenIntervention = useSafetyUIStore((state) => state.reopenIntervention);
  const dismissCompanion = useSafetyUIStore((state) => state.dismissCompanion);

  // Jika modal sedang terbuka atau companion tidak aktif, sembunyikan
  if (!isCompanionVisible || isModalOpen) {
    return null;
  }

  return (
    <div
      className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
      aria-live="polite"
    >
      <button
        type="button"
        onClick={reopenIntervention}
        className="flex items-center gap-2 px-3.5 py-2 bg-paper-base hover:bg-paper-warm border-[1.5px] border-ink-charcoal rounded-full shadow-[3px_3px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer group text-left"
        title="Buka kembali bantuan krisis & dukungan aman"
        aria-label="Buka kembali bantuan krisis dan dukungan aman"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-marker-orange animate-pulse shrink-0" />
        <span className="material-symbols-outlined text-marker-orange text-[18px]">
          health_and_safety
        </span>
        <span className="font-mono-tag text-xs font-bold text-ink-charcoal tracking-wide">
          Bantuan Siap Mendampingi
        </span>
      </button>

      <button
        type="button"
        onClick={dismissCompanion}
        aria-label="Sembunyikan ikon bantuan"
        className="w-6 h-6 rounded-full bg-paper-warm/80 hover:bg-paper-base border border-ink-charcoal/40 flex items-center justify-center text-[10px] text-ink-charcoal/70 hover:text-ink-charcoal transition-colors cursor-pointer"
        title="Tutup pendamping bantuan"
      >
        ✕
      </button>
    </div>
  );
}
