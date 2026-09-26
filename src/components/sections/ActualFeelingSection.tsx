"use client";

import React from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { useJournalStore } from "@/store/useJournalStore";

const FEELING_OPTIONS = [
  "Lelah",
  "Cemas",
  "Kewalahan",
  "Sedih",
  "Kesepian",
  "Bingung",
  "Marah",
  "Hampa",
  "Biasa saja",
  "Tenang",
  "Termotivasi",
];

export function ActualFeelingSection() {
  const { actualFeelings, toggleActualFeeling, feelingNote, setFeelingNote } = useJournalStore();
  const selected = actualFeelings;

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="MASK 02/04" showSteps={true} stepNumber={1} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 pt-6 md:pt-12">

        <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[4px_4px_0px_#171717] p-4 sm:p-6 md:p-8">
          {/* Desktop Sticker Badge */}
          <aside className="hidden md:flex absolute -top-8 right-8 z-10 rotate-6 hover:rotate-2 transition-transform duration-300">
            <div className="bg-sticker-blue border-[1.5px] border-ink-charcoal rounded-xl p-3 md:p-4 shadow-[3px_3px_0px_#171717] flex flex-col items-center max-w-[130px]">
              <div className="w-12 h-12 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal flex items-center justify-center mb-1 shadow-[1px_1px_0px_#171717]">
                <span className="material-symbols-outlined text-2xl text-ink-charcoal">
                  theater_comedy
                </span>
              </div>
            </div>
          </aside>

          {/* Mobile Badge - Clean inline position so it never overlaps the title */}
          <div className="md:hidden flex items-center gap-2 mb-3 bg-sticker-blue/30 border border-ink-charcoal px-3 py-1 rounded-lg w-fit shadow-[1px_1px_0px_#171717]">
            <span className="material-symbols-outlined text-[16px] text-ink-charcoal">
              theater_comedy
            </span>
            <span className="font-mono-tag text-[10px] font-bold text-ink-charcoal uppercase tracking-wider">
              ACTUAL FEELING · LAPISAN KEDUA
            </span>
          </div>
          <div className="max-w-[800px] mb-4 sm:mb-6">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-charcoal lowercase tracking-tight leading-snug mb-2">
              “bagaimana perasaanmu sebenarnya?”
            </h1>
            <p className="text-sm md:text-base text-ink-charcoal/90">
              Pilih beberapa kata yang paling menggambarkan perasaanmu saat ini.
            </p>
          </div>

          <div className="w-full">
            <div className="w-full">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {FEELING_OPTIONS.map((item) => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleActualFeeling(item)}
                      type="button"
                      className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] font-mono-tag text-xs sm:text-sm transition-all ${isSelected
                        ? "bg-paper-warm text-ink-charcoal font-bold"
                        : "bg-paper-base text-ink-charcoal hover:bg-paper-warm"
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full border border-ink-charcoal ${isSelected ? "bg-marker-orange" : "bg-transparent"
                          }`}
                      ></span>
                      <span>{item}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-ink-charcoal font-bold">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-paper-warm rounded-lg border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717]">
                <label
                  className="font-mono-tag text-xs uppercase tracking-wider text-ink-charcoal font-bold flex items-center gap-1.5 mb-2"
                  htmlFor="inner-note"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Catatan Bebas (Opsional)
                </label>
                <textarea
                  className="w-full bg-paper-base border-[1.5px] border-ink-charcoal rounded-lg p-3 text-xs sm:text-sm text-ink-charcoal placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-marker-orange"
                  id="inner-note"
                  placeholder="Jika ada kata lain yang ingin kamu luapkan sekarang..."
                  rows={2}
                  maxLength={500}
                  value={feelingNote || ""}
                  onChange={(e) => setFeelingNote(e.target.value.slice(0, 500))}
                ></textarea>
              </div>
            </div>

          </div>
        </div>
      </main>

      <BottomDock backTo="/public-self" nextTo="/mask-result" centerLabel="" />
    </div>
  );
}
