"use client";

import React, { useEffect, useRef } from "react";
import { CRISIS_RESOURCES, resolveResources } from "@/lib/safety/crisisResources";
import { SafetyInterventionUI, SafetyModalMode } from "@/store/useSafetyUIStore";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: SafetyModalMode;
  intervention?: SafetyInterventionUI | null;
}

const SAFETY_TITLES: Record<string, string> = {
  suicidal_risk: "Ada bagian yang perlu kita perhatikan sebentar.",
  self_harm: "Mari berhenti sebentar dan cari ruang yang lebih aman.",
  imminent_physical_danger: "Yang paling penting sekarang adalah tetap aman.",
  unsafe_action: "Langkah ini sebaiknya kita ubah menjadi pilihan yang lebih aman.",
  other: "Mari berhenti sebentar.",
};

export function CrisisModal({
  isOpen,
  onClose,
  mode = "manual",
  intervention,
}: CrisisModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isIntervention = mode === "intervention" && Boolean(intervention);
  const title = isIntervention && intervention?.category
    ? SAFETY_TITLES[intervention.category] || SAFETY_TITLES.other
    : "Kamu tidak harus menanggung semuanya sendirian.";

  const resourcesToDisplay = isIntervention && intervention?.recommendedResourceIds
    ? resolveResources(intervention.recommendedResourceIds)
    : CRISIS_RESOURCES;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="safety-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-charcoal/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="bg-paper-base border-[2px] border-ink-charcoal rounded-2xl p-4 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[6px_6px_0px_#171717] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Badge & Close Button */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink-charcoal/20">
          <div className="flex items-center gap-2 text-marker-orange font-bold font-mono-tag text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
            <span>{isIntervention ? "Dukungan Keselamatan Diri" : "Bantuan & Dukungan Krisis"}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup bantuan"
            className="w-7 h-7 rounded-full bg-paper-warm border border-ink-charcoal flex items-center justify-center text-xs font-bold text-ink-charcoal hover:bg-marker-orange transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Title */}
        <h3
          id="safety-modal-title"
          className="font-headline text-xl sm:text-2xl font-bold text-ink-charcoal mb-3"
        >
          {title}
        </h3>

        {/* Supportive Context Body */}
        {isIntervention && intervention ? (
          <div className="mb-4">
            <p className="text-xs sm:text-sm text-ink-charcoal/90 mb-3 leading-relaxed whitespace-pre-line bg-paper-warm/60 p-3.5 rounded-xl border border-ink-charcoal/30">
              {intervention.supportiveResponse}
            </p>

            {intervention.saferNextStep && (
              <div className="p-3 bg-sticker-sage/20 border border-ink-charcoal/40 rounded-xl mb-4">
                <div className="flex items-center gap-1.5 text-xs font-bold font-mono-tag text-ink-charcoal uppercase mb-1">
                  <span className="material-symbols-outlined text-sm text-burnt-orange">spa</span>
                  <span>Satu Langkah Lebih Aman Sekarang</span>
                </div>
                <p className="text-xs text-ink-charcoal/80 leading-relaxed">
                  {intervention.saferNextStep}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-ink-charcoal/80 mb-5 leading-relaxed">
            Jika rasa lelah atau berat terasa begitu luar biasa saat ini, ada orang-orang yang siap mendengarkan tanpa menghakimi. Silakan hubungi layanan bantuan berikut:
          </p>
        )}

        {/* Resources Heading */}
        <div className="text-xs font-mono-tag font-bold uppercase tracking-wider text-ink-charcoal/70 mb-2">
          Kontak Bantuan Terverifikasi:
        </div>

        {/* Resource Cards */}
        <div className="space-y-2.5 mb-6">
          {resourcesToDisplay.map((res) => (
            <a
              key={res.id}
              href={res.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-paper-warm hover:bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-xl shadow-[2px_2px_0px_#171717] transition-all"
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="font-headline font-bold text-sm text-ink-charcoal">
                  {res.name}
                </span>
                <span className="font-mono-tag text-[11px] font-bold text-burnt-orange bg-paper-base px-2 py-0.5 rounded border border-ink-charcoal shrink-0">
                  {res.contact}
                </span>
              </div>
              <p className="text-xs text-ink-charcoal/70 leading-relaxed">
                {res.description}
              </p>
            </a>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-ink-charcoal/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-paper-warm hover:bg-paper-base border border-ink-charcoal rounded-full font-mono-tag text-xs font-bold text-ink-charcoal transition-colors shadow-[2px_2px_0px_#171717] cursor-pointer"
          >
            Kembali ke Jurnal
          </button>
        </div>
      </div>
    </div>
  );
}
