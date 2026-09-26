"use client";

import React from "react";
import { INDONESIA_EMERGENCY_RESOURCES } from "@/lib/safety/crisisKeywords";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-charcoal/60 backdrop-blur-xs">
      <div className="bg-paper-base border-[2px] border-ink-charcoal rounded-2xl p-4 sm:p-8 max-w-lg w-full max-h-[88vh] overflow-y-auto shadow-[6px_6px_0px_#171717] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink-charcoal/20">
          <div className="flex items-center gap-2 text-marker-orange font-bold font-mono-tag text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
            <span>Bantuan & Dukungan Krisis</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-paper-warm border border-ink-charcoal flex items-center justify-center text-xs font-bold text-ink-charcoal hover:bg-marker-orange transition-colors"
          >
            ✕
          </button>
        </div>

        <h3 className="font-headline text-xl sm:text-2xl font-bold text-ink-charcoal mb-2">
          Kamu tidak harus menanggung semuanya sendirian.
        </h3>
        <p className="text-xs sm:text-sm text-ink-charcoal/80 mb-5 leading-relaxed">
          Jika rasa lelah atau berat terasa begitu luar biasa saat ini, ada orang-orang yang siap mendengarkan tanpa menghakimi. Silakan hubungi layanan bantuan berikut:
        </p>

        <div className="space-y-3 mb-6">
          {INDONESIA_EMERGENCY_RESOURCES.map((res, i) => (
            <a
              key={i}
              href={res.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3.5 bg-paper-warm hover:bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-xl shadow-[2px_2px_0px_#171717] transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-headline font-bold text-sm text-ink-charcoal">
                  {res.name}
                </span>
                <span className="font-mono-tag text-xs font-bold text-burnt-orange bg-paper-base px-2 py-0.5 rounded border border-ink-charcoal">
                  {res.contact}
                </span>
              </div>
              <p className="text-xs text-ink-charcoal/70">
                {res.description}
              </p>
            </a>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-paper-warm hover:bg-paper-base border border-ink-charcoal rounded-full font-mono-tag text-xs font-bold text-ink-charcoal transition-colors shadow-[2px_2px_0px_#171717]"
          >
            Kembali ke Jurnal
          </button>
        </div>
      </div>
    </div>
  );
}
