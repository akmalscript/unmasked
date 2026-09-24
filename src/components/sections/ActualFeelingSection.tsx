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
  const selected = actualFeelings || ["Lelah", "Kewalahan"];

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="MASK 02/04" showSteps={true} stepNumber={1} totalSteps={4} />

      <main className="max-w-[1120px] mx-auto px-6 md:px-12 pt-8 md:pt-12 flex-grow">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] -rotate-1 rounded font-script text-lg font-bold">
            MASK
          </div>
          <span className="font-mono-tag text-xs text-outline">Bagian 2 : Lapisan Terdalam Batin</span>
        </div>

        <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[4px_4px_0px_#171717] p-6 md:p-10">
          <div className="relative max-w-2xl z-10 mb-6">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-ink-charcoal tracking-tight lowercase mb-2">
              “bagaimana kamu benar-benar merasa?”
            </h1>
            <p className="text-sm md:text-base text-ink-charcoal/80">
              Pilih beberapa kata yang paling menggambarkan perasaanmu saat ini. Tidak perlu
              disaring, tidak perlu ditutupi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 mb-3 text-marker-orange font-script text-xl font-bold select-none">
                <span>“what&apos;s underneath?”</span>
                <span className="material-symbols-outlined text-lg">draw</span>
              </div>

              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {FEELING_OPTIONS.map((item) => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleActualFeeling(item)}
                      type="button"
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] font-mono-tag text-xs sm:text-sm transition-all ${
                        isSelected
                          ? "bg-paper-warm text-ink-charcoal font-bold"
                          : "bg-paper-base text-ink-charcoal hover:bg-paper-warm"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full border border-ink-charcoal ${
                          isSelected ? "bg-marker-orange" : "bg-transparent"
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

              <div className="mt-8 p-4 bg-paper-warm rounded-lg border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717]">
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
                  value={feelingNote || ""}
                  onChange={(e) => setFeelingNote(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center gap-6">
              <div className="w-full max-w-[240px] bg-sticker-pink p-5 rounded-2xl border-[1.5px] border-ink-charcoal shadow-[4px_4px_0px_#171717] rotate-2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-24 my-2 relative flex flex-col items-center justify-center border-[1.5px] border-ink-charcoal rounded-t-full rounded-b-[36px] bg-paper-base shadow-[2px_2px_0px_#171717]">
                    <div className="flex gap-3 mb-2">
                      <div className="w-2.5 h-1 bg-ink-charcoal rounded-full rotate-6"></div>
                      <div className="w-2.5 h-1 bg-ink-charcoal rounded-full -rotate-6"></div>
                    </div>
                    <div className="w-3.5 h-0.5 bg-ink-charcoal rounded-full mt-1"></div>
                  </div>
                  <span className="font-mono-tag text-[10px] uppercase font-bold bg-paper-base px-2 py-0.5 border border-ink-charcoal rounded mt-2">
                    Ruang Otentik
                  </span>
                  <p className="text-xs text-ink-cocoa mt-2 italic font-script text-base">
                    &quot;Di balik kata &apos;baik-baik saja&apos;, ada jiwa yang hanya butuh diakui lelahnya.&quot;
                  </p>
                </div>
              </div>

              <div className="w-full max-w-[240px] bg-sticker-sage p-4 rounded-xl border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] -rotate-1">
                <div className="font-mono-tag text-xs font-bold text-ink-charcoal mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                  PENGINGAT KECIL
                </div>
                <p className="text-xs text-ink-charcoal/90">
                  Semua emosi valid. Mengakui kewalahan adalah langkah awal kembali bernapas lega.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomDock backTo="/public-self" nextTo="/mask-result" centerLabel="MASK: Perasaan Sebenarnya" />
    </div>
  );
}
