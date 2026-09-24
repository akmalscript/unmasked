"use client";

import React from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { useJournalStore } from "@/store/useJournalStore";

export function NeedSheetSection() {
  const { restRating, setRestRating } = useJournalStore();
  const rating = restRating || 2;

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="NEED 01/02" showSteps={true} stepNumber={3} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 pt-8 pb-12 flex flex-col items-center">
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] font-mono-tag text-xs uppercase font-bold">
            NEED
          </span>
          <span className="font-mono-tag text-xs text-outline">Langkah 1 dari 2</span>
        </div>

        <section className="w-full max-w-2xl text-center mb-8">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase mb-2">
            “apa yang kamu butuhkan saat ini?”
          </h1>
          <p className="text-sm md:text-base text-ink-charcoal/80 max-w-md mx-auto">
            Jawab beberapa pertanyaan kecil sesuai dengan keadaanmu sekarang.
          </p>
        </section>

        <section className="w-full max-w-2xl bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[4px_4px_0px_#171717] p-6 sm:p-9 relative mb-8">
          <div className="absolute -top-3.5 left-8 px-4 py-1 bg-sticker-pink border-[1.5px] border-ink-charcoal rounded-sm font-mono-tag text-xs text-ink-charcoal -rotate-3 shadow-[2px_2px_0px_#171717] pointer-events-none">
            jeda sejenak
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-full mb-6 pt-2 text-center">
              <p className="font-mono-tag text-xs text-outline uppercase tracking-wider mb-2">
                Pertanyaan Refleksi
              </p>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-ink-charcoal leading-snug">
                “Seberapa cukup waktu istirahat yang kamu rasakan saat ini?”
              </h2>
            </div>

            <div className="grid grid-cols-5 gap-2.5 sm:gap-4 w-full mb-4">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = rating === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRestRating(val)}
                    className={`w-full aspect-square sm:h-20 rounded-xl border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-surface-container-lowest border-[2px] border-marker-orange ring-1 ring-marker-orange"
                        : "bg-paper-warm hover:translate-x-[1px] hover:translate-y-[1px]"
                    }`}
                  >
                    <span
                      className={`font-headline text-xl sm:text-2xl font-bold ${
                        isSelected ? "text-burnt-orange" : "text-ink-charcoal"
                      }`}
                    >
                      {val}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-marker-orange mt-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="w-full flex justify-between items-center px-1 mb-6 font-mono-tag text-xs text-ink-charcoal/70">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-burnt-orange">
                  arrow_left_alt
                </span>
                <span>Sangat kurang</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Sangat cukup</span>
                <span className="material-symbols-outlined text-[15px] text-burnt-orange">
                  arrow_right_alt
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-center gap-2 pt-3 border-t-[1.5px] border-dashed border-outline-variant">
              <span className="material-symbols-outlined text-marker-orange text-lg">draw</span>
              <p className="font-script text-2xl text-marker-orange font-bold -rotate-1">
                “be honest.”
              </p>
              <span className="text-xs text-outline italic">
                — tidak ada jawaban yang salah di sini.
              </span>
            </div>
          </div>
        </section>
      </main>

      <BottomDock
        backTo="/story-reflection"
        nextTo="/need-result"
        nextLabel="Lihat Hasil Kebutuhan"
        centerLabel="NEED: Skala Istirahat"
      />
    </div>
  );
}
