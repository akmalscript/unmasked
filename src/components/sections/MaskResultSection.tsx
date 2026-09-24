"use client";

import React from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { useJournalStore } from "@/store/useJournalStore";

export function MaskResultSection() {
  const { publicTags, actualFeelings } = useJournalStore();
  const currentPublicTags = publicTags.length ? publicTags : ["Produktif", "Kuat"];
  const currentActualFeelings = actualFeelings.length ? actualFeelings : ["Lelah", "Kewalahan"];

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="MASK 03/04" showSteps={true} stepNumber={1} totalSteps={4} />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 md:px-12 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl shadow-[6px_6px_0px_#171717] p-6 sm:p-10 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-secondary-fixed/90 border-[1.2px] border-ink-charcoal rotate-[-1deg] shadow-[1px_1px_0px_#171717] flex items-center justify-center z-20">
            <span className="text-[9px] font-mono-tag uppercase tracking-widest text-on-secondary-fixed font-bold">
              HASIL SEMENTARA
            </span>
          </div>

          <div className="text-center mb-8 pt-2">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-charcoal lowercase tracking-tight leading-snug">
              “ada jarak antara yang kamu tampilkan dan rasakan.”
            </h1>
            <p className="text-xs sm:text-sm text-ink-charcoal/70 mt-2 max-w-md mx-auto">
              Catatan visual dari dua sisi yang kamu bawa dalam interaksi sehari-hari.
            </p>
          </div>

          <div className="relative py-6 my-2 flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Left Card: Tampilan luar */}
            <div className="w-full sm:w-1/2 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[4px_4px_0px_#171717] -rotate-2">
              <div className="flex items-center justify-between mb-3 border-b border-ink-charcoal/20 pb-2">
                <span className="font-mono-tag text-xs text-ink-charcoal/70 lowercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sticker-blue border border-ink-charcoal"></span>
                  tampilan luar
                </span>
                <span className="material-symbols-outlined text-ink-charcoal/40 text-[16px]">
                  visibility
                </span>
              </div>
              <p className="font-headline text-sm font-semibold text-ink-charcoal mb-3">
                orang melihat kamu sebagai
              </p>
              <div className="flex flex-wrap gap-2">
                {currentPublicTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-sticker-blue/40 text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs px-3 py-1 rounded-full shadow-[1.5px_1.5px_0px_#171717] font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Card: Perasaan batin */}
            <div className="w-full sm:w-1/2 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[5px_5px_0px_#171717] rotate-2">
              <div className="flex items-center justify-between mb-3 border-b border-ink-charcoal/20 pb-2">
                <span className="font-mono-tag text-xs text-burnt-orange font-bold lowercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-marker-orange border border-ink-charcoal"></span>
                  ruang batin
                </span>
                <span className="material-symbols-outlined text-marker-orange text-[16px]">
                  favorite
                </span>
              </div>
              <p className="font-headline text-sm font-semibold text-ink-charcoal mb-3">
                namun kamu merasa
              </p>
              <div className="flex flex-wrap gap-2">
                {currentActualFeelings.map((f) => (
                  <span
                    key={f}
                    className="bg-sticker-pink text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs px-3 py-1 rounded-full shadow-[1.5px_1.5px_0px_#171717] font-semibold"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t-[1.5px] border-ink-charcoal/20 text-center">
            <p className="text-base sm:text-lg text-ink-charcoal max-w-xl mx-auto leading-relaxed">
              Sepertinya ada{" "}
              <span className="wavy-underline font-semibold text-ink-charcoal">jarak</span> antara
              bagaimana kamu terlihat di luar dan bagaimana kamu sebenarnya merasa di dalam.
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-marker-orange font-script text-2xl">
              <span className="material-symbols-outlined text-lg">draw</span>
              <span>“that&apos;s worth noticing.”</span>
            </div>
            <p className="text-xs sm:text-sm text-ink-charcoal/70 mt-2 max-w-md mx-auto">
              Kamu tidak harus selalu tampil sempurna. Mengakui rasa lelah ini adalah langkah awal
              melepaskan beban yang berlebih.
            </p>
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/actual-feeling"
        nextTo="/brain-dump"
        nextLabel="Lanjut ke LOAD"
        centerLabel="MASK Selesai"
      />
    </div>
  );
}
