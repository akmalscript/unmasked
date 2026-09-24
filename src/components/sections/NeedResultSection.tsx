"use client";

import React from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";

export function NeedResultSection() {
  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="NEED 02/02" showSteps={true} stepNumber={3} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-8 md:py-12">
        <div className="max-w-3xl mb-8">
          <p className="font-mono-tag text-xs font-bold text-burnt-orange uppercase tracking-wider mb-1">
            PENILAIAN DIRI TERBUKA
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
            “area kebutuhanmu saat ini”
          </h1>
          <p className="text-sm md:text-base text-ink-charcoal/80 mt-2">
            Berdasarkan refleksimu, beberapa area ini mungkin sedang membutuhkan perhatian.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-6 shadow-[4px_4px_0px_#171717]">
            <div className="flex items-center justify-between pb-3 mb-5 border-b-[1.5px] border-ink-charcoal font-mono-tag text-xs">
              <span className="uppercase font-bold text-ink-charcoal">
                Indikator Kebutuhan Pokok
              </span>
              <span className="bg-paper-warm border border-ink-charcoal px-2 py-0.5 rounded">
                Skala 1 — 5
              </span>
            </div>

            <div className="space-y-4">
              {/* REST */}
              <div className="p-3.5 bg-paper-warm rounded-lg border-[1.5px] border-ink-charcoal">
                <div className="flex justify-between items-center mb-1.5 font-mono-tag text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-burnt-orange text-[16px]">
                      bedtime
                    </span>
                    <span className="font-bold text-ink-charcoal">REST</span>
                    <span className="bg-marker-orange text-white px-2 py-0.2 rounded-full text-[10px]">
                      Prioritas
                    </span>
                  </div>
                  <span className="font-bold text-burnt-orange">4 / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 h-4 bg-paper-base border border-ink-charcoal p-0.5 rounded">
                  <div className="bg-marker-orange"></div>
                  <div className="bg-marker-orange"></div>
                  <div className="bg-marker-orange"></div>
                  <div className="bg-marker-orange"></div>
                  <div className="bg-paper-warm"></div>
                </div>
                <p className="text-xs text-ink-charcoal/70 mt-1 italic">
                  Kebutuhan tubuh & pikiran untuk jeda dari stimulus yang berlebih.
                </p>
              </div>

              {/* CONTROL */}
              <div className="p-3.5 bg-paper-warm rounded-lg border-[1.5px] border-ink-charcoal">
                <div className="flex justify-between items-center mb-1.5 font-mono-tag text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-burnt-orange text-[16px]">
                      tune
                    </span>
                    <span className="font-bold text-ink-charcoal">CONTROL</span>
                    <span className="bg-marker-orange text-white px-2 py-0.2 rounded-full text-[10px]">
                      Perlu Atensi
                    </span>
                  </div>
                  <span className="font-bold text-burnt-orange">4 / 5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 h-4 bg-paper-base border border-ink-charcoal p-0.5 rounded">
                  <div className="bg-marker-orange"></div>
                  <div className="bg-marker-orange"></div>
                  <div className="bg-marker-orange"></div>
                  <div className="bg-marker-orange"></div>
                  <div className="bg-paper-warm"></div>
                </div>
                <p className="text-xs text-ink-charcoal/70 mt-1 italic">
                  Keinginan untuk kembali memegang kendali atas ritme dan batasan pribadimu.
                </p>
              </div>

              {/* CONNECTION */}
              <div className="p-3 bg-paper-base rounded-lg border-[1.5px] border-ink-charcoal font-mono-tag text-xs flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  <span>CONNECTION</span>
                </div>
                <span>2 / 5</span>
              </div>

              {/* EXPRESSION */}
              <div className="p-3 bg-paper-base rounded-lg border-[1.5px] border-ink-charcoal font-mono-tag text-xs flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                  <span>EXPRESSION</span>
                </div>
                <span>3 / 5</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-6 shadow-[4px_4px_0px_#171717]">
              <div className="flex items-center gap-2 text-burnt-orange mb-2 font-mono-tag text-xs font-bold uppercase">
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                <span>Ringkasan Reflektif</span>
              </div>
              <blockquote className="font-headline font-semibold text-sm sm:text-base text-ink-charcoal mb-3 leading-snug">
                “Dari refleksimu, mungkin kamu sedang membutuhkan lebih banyak ruang untuk
                beristirahat dan mendapatkan kembali rasa kendali.”
              </blockquote>
              <p className="text-xs sm:text-sm text-ink-charcoal/80 leading-relaxed">
                Tubuh dan pikiranmu sedang meminta jeda yang sah. Rasa lelah bukan tanda kegagalan.
              </p>
            </div>

            <div className="bg-[#FFF4DC] border-[1.5px] border-ink-charcoal rounded-lg p-4 shadow-[3px_3px_0px_#171717] -rotate-1">
              <span className="font-mono-tag text-[10px] text-ink-charcoal/60 uppercase font-bold block mb-1">
                catatan pinggir ★
              </span>
              <p className="font-script text-2xl text-ink-cocoa font-bold">
                “you don&apos;t have to fix everything today.”
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/need-sheet"
        nextTo="/action-step"
        nextLabel="Lanjut ke ACTION"
        centerLabel="Kebutuhan Terpetakan"
      />
    </div>
  );
}
