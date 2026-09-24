"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { useJournalStore } from "@/store/useJournalStore";

export function SummarySection() {
  const router = useRouter();
  const { publicTags, actualFeelings, selectedAction, restRating } = useJournalStore();
  const [downloaded, setDownloaded] = useState(false);

  const currentPublicTags = publicTags.length ? publicTags : ["Produktif", "Kuat"];
  const currentActualFeelings = actualFeelings.length ? actualFeelings : ["Lelah", "Kewalahan"];
  const currentAction =
    selectedAction ||
    "Memberi ruang untuk menyelesaikan satu tugas malam ini dan melanjutkan sisanya besok.";

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-warm tactile-dot-grid pb-28">
      <Header subtitle="RANGKUMAN" showSteps={true} stepNumber={4} totalSteps={4} />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 md:px-12 py-8 md:py-12">
        <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl md:rounded-2xl p-6 sm:p-10 md:p-12 shadow-[4px_4px_0px_#171717]">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-full mb-3 font-mono-tag text-xs">
              <span className="w-2 h-2 rounded-full bg-marker-orange animate-pulse"></span>
              <span>Perjalanan Refleksi Lengkap</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
              “rangkuman perjalananmu.”
            </h1>
            <p className="text-sm sm:text-base text-ink-charcoal/80 mt-2">
              Ini yang kamu temukan tentang dirimu hari ini.
            </p>
            <p className="font-script text-2xl text-marker-orange font-bold mt-2">
              “look how much you unpacked.”
            </p>
          </div>

          {/* Timeline Steps */}
          <div className="relative max-w-xl mx-auto space-y-6">
            {/* 1. MASK */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono-tag font-bold">
                01
              </div>
              <div className="flex-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-4 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-2 mb-2 font-mono-tag text-xs font-bold uppercase">
                  <span>Step 1: MASK</span>
                  <span className="material-symbols-outlined text-[16px]">theater_comedy</span>
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    Tampilan luar: <strong>{currentPublicTags.join(" · ")}</strong>
                  </div>
                  <div className="text-burnt-orange font-semibold">
                    Ruang batin: <strong>{currentActualFeelings.join(" · ")}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LOAD */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono-tag font-bold">
                02
              </div>
              <div className="flex-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-4 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-2 mb-2 font-mono-tag text-xs font-bold uppercase">
                  <span>Step 2: LOAD</span>
                  <span className="material-symbols-outlined text-[16px]">weight</span>
                </div>
                <p className="text-xs text-ink-charcoal/80 mb-2">Beban utama yang sedang dipikul:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-sticker-blue border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold">
                    Academic Pressure
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold">
                    Expectation
                  </span>
                </div>
              </div>
            </div>

            {/* 3. NEED */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono-tag font-bold">
                03
              </div>
              <div className="flex-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-4 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-2 mb-2 font-mono-tag text-xs font-bold uppercase">
                  <span>Step 3: NEED</span>
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-sticker-sage border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold">
                    Rest ({restRating || 4}/5)
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold">
                    Control (4/5)
                  </span>
                </div>
              </div>
            </div>

            {/* 4. ACTION */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono-tag font-bold">
                04
              </div>
              <div className="flex-1 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-4 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-2 mb-2 font-mono-tag text-xs font-bold uppercase">
                  <span>Step 4: ACTION</span>
                  <span className="material-symbols-outlined text-marker-orange text-[16px]">
                    auto_awesome
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-headline italic font-semibold text-ink-charcoal">
                  “{currentAction}”
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t-[1.5px] border-ink-charcoal/20 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-paper-base text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs uppercase shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>{downloaded ? "Tersimpan di Perangkat" : "Unduh Rangkuman"}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/selesai")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold uppercase shadow-[3px_3px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              <span>Selesai Sesi</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/action-step"
        nextTo="/selesai"
        nextLabel="Selesai"
        centerLabel="Semua Langkah Selesai"
      />
    </div>
  );
}
