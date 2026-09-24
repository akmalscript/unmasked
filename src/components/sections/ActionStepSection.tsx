"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { useJournalStore } from "@/store/useJournalStore";

const ACTIONS = [
  "Pilih satu tugas yang harus diselesaikan malam ini dan izinkan dirimu untuk melanjutkannya besok tanpa rasa bersalah.",
  "Luangkan 15 menit berjalan kaki sore tanpa ponsel dan biarkan pikiranmu bernapas.",
  "Tuliskan tiga hal yang sudah berhasil kamu selesaikan hari ini sebelum tidur.",
  "Katakan 'tidak' pada satu komitmen tambahan minggu ini yang sebenarnya memberatkanmu.",
];

export function ActionStepSection() {
  const { selectedAction, setSelectedAction } = useJournalStore();
  const [accepted, setAccepted] = useState(false);
  const [actionIndex, setActionIndex] = useState(0);

  const currentAction =
    selectedAction || ACTIONS[0];

  const handleNextAlternative = () => {
    const nextIdx = (actionIndex + 1) % ACTIONS.length;
    setActionIndex(nextIdx);
    setSelectedAction(ACTIONS[nextIdx]);
    setAccepted(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="ACTION" showSteps={true} stepNumber={4} totalSteps={4} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="mb-3">
          <div className="bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal px-3.5 py-1 rounded-full font-mono-tag text-xs font-bold tracking-wider shadow-[2px_2px_0px_#171717] -rotate-1">
            STAGE: ACTION
          </div>
        </div>

        <div className="max-w-[700px] text-center mb-8">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
            “satu langkah kecil untukmu.”
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink-charcoal/80">
            Bukan semuanya. Cukup satu hal yang terasa mungkin dilakukan hari ini.
          </p>
        </div>

        <div className="relative w-full max-w-[620px] mb-8">
          <div className="absolute -top-6 -right-2 md:-right-6 z-20 -rotate-3 select-none pointer-events-none">
            <div className="font-script text-marker-orange text-2xl md:text-3xl font-bold">
              “small is enough.”
            </div>
          </div>

          <div className="relative bg-paper-warm border-[1.5px] border-ink-charcoal rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#171717]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-5 border-b-[1.5px] border-ink-charcoal/15 font-mono-tag text-xs">
              <div className="bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-3 shadow-[1.5px_1.5px_0px_#171717]">
                <span className="text-ink-charcoal/60 uppercase font-semibold block mb-0.5">
                  1. Kebutuhan
                </span>
                <span className="font-headline font-bold text-sm text-ink-charcoal">Rest</span>
              </div>
              <div className="bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-3 shadow-[1.5px_1.5px_0px_#171717]">
                <span className="text-ink-charcoal/60 uppercase font-semibold block mb-0.5">
                  2. Berkaitan Dengan
                </span>
                <span className="font-headline font-bold text-sm text-ink-charcoal">
                  Academic Pressure
                </span>
              </div>
            </div>

            <div className="py-5">
              <span className="font-mono-tag text-xs uppercase tracking-wider font-bold text-burnt-orange bg-secondary-fixed/50 px-2 py-0.5 rounded border border-burnt-orange/30">
                3. Langkah Kecil Terpilih
              </span>
              <div className="mt-2.5 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-4 shadow-[3px_3px_0px_#171717] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-marker-orange"></div>
                <blockquote className="pl-2 font-headline text-base sm:text-lg text-ink-charcoal font-semibold leading-snug italic">
                  “{currentAction}”
                </blockquote>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-mono-tag text-xs uppercase font-bold text-ink-charcoal/70 flex items-center gap-1 mb-1.5">
                <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                4. Kenapa Ini?
              </span>
              <p className="p-3 bg-paper-base/60 border border-ink-charcoal/20 rounded-xl text-xs sm:text-sm text-ink-charcoal/90 leading-relaxed">
                Memberi ruang untuk beristirahat dapat membantu mengurangi rasa kewalahan dan
                mengembalikan fokusmu secara perlahan.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t-[1.5px] border-ink-charcoal/15 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleNextAlternative}
                className="w-full sm:w-auto px-5 py-2 bg-paper-base hover:bg-paper-warm text-ink-charcoal border-[1.5px] border-ink-charcoal rounded-full font-mono-tag text-xs font-bold shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                Coba alternatif lain
              </button>
              <button
                type="button"
                onClick={() => setAccepted(!accepted)}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-mono-tag text-xs font-bold border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                  accepted
                    ? "bg-sticker-sage text-ink-charcoal"
                    : "bg-marker-orange text-ink-charcoal hover:bg-burnt-orange"
                }`}
              >
                {accepted ? "✓ Langkah Ini Disepakati" : "Saya akan mencoba ini"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/need-result"
        nextTo="/summary"
        nextLabel="Lihat Rangkuman"
        centerLabel="ACTION: Langkah Kecil"
      />
    </div>
  );
}
