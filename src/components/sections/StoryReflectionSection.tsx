"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";

export function StoryReflectionSection() {
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="LOAD 02/02" showSteps={true} stepNumber={2} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-[760px] text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] mb-3">
            <span className="w-2 h-2 rounded-full bg-marker-orange animate-pulse"></span>
            <span className="font-mono-tag text-xs uppercase font-semibold text-ink-cocoa">
              Tahap: Load / Refleksi Awal
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-ink-charcoal lowercase mb-2">
            “ini yang kami tangkap dari ceritamu.”
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ink-charcoal/80 max-w-[620px] mx-auto">
            Kami mencoba merapikan apa yang kamu tulis menjadi beberapa hal yang mungkin sedang kamu bawa.
          </p>
        </div>

        <div className="w-full max-w-[760px] bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[6px_6px_0px_#171717] relative overflow-hidden">
          <div className="bg-paper-warm border-b-[1.5px] border-ink-charcoal px-5 py-2.5 flex items-center justify-between font-mono-tag text-xs text-ink-charcoal/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-sticker-pink"></span>
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-tertiary-fixed"></span>
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-sticker-sage"></span>
              <span className="ml-1 font-semibold">catatan_refleksi_08.md</span>
            </div>
            <span>Analisis Lembut</span>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div>
              <div className="font-mono-tag text-xs font-bold text-ink-charcoal flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-marker-orange inline-block"></span>
                1. BEBAN
              </div>
              <div className="bg-paper-warm/90 border-[1.5px] border-ink-charcoal rounded-lg p-4 md:p-5 shadow-[3px_3px_0px_#171717]">
                <blockquote className="text-sm md:text-base text-ink-charcoal italic font-medium leading-relaxed pl-2 border-l-[3px] border-marker-orange">
                  “Kamu merasa kewalahan dengan banyaknya tugas kuliah dan takut tidak bisa memenuhi ekspektasi.”
                </blockquote>
              </div>
            </div>

            <div>
              <div className="font-mono-tag text-xs font-bold text-ink-charcoal flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-sticker-blue inline-block"></span>
                2. TEMA
              </div>
              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sticker-blue border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold text-ink-charcoal shadow-[2px_2px_0px_#171717]">
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  Academic Pressure
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sticker-pink border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold text-ink-charcoal shadow-[2px_2px_0px_#171717]">
                  <span className="material-symbols-outlined text-[14px]">adjust</span>
                  Expectation
                </span>
              </div>
            </div>

            <div>
              <div className="font-mono-tag text-xs font-bold text-ink-charcoal flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 bg-sticker-sage inline-block"></span>
                3. KONTEKS EMOSIONAL & KATEGORI
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-semibold text-burnt-orange">
                  Cemas
                </span>
                <span className="px-3 py-1 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-semibold text-burnt-orange">
                  Kewalahan
                </span>
                <span className="px-3 py-1 bg-tertiary-fixed border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold rounded shadow-[1.5px_1.5px_0px_#171717]">
                  Kategori: Act (Perlu Penguraian Bertahap)
                </span>
              </div>
            </div>

            <div className="bg-paper-warm/60 border-[1.5px] border-ink-charcoal rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-headline font-semibold text-sm sm:text-base text-ink-charcoal">
                  Apakah ini sesuai dengan yang kamu maksud?
                </p>
                <p className="text-xs text-ink-charcoal/70">
                  Kamu memiliki kendali penuh untuk menyelaraskan atau mengoreksi.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVerified(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold shadow-[2px_2px_0px_#171717] transition-all ${
                    isVerified ? "bg-marker-orange text-white" : "bg-sticker-sage text-ink-charcoal"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>{isVerified ? "Tersimpan" : "Ya, sesuai"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/brain-dump")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border-[1.5px] border-ink-charcoal bg-paper-base text-ink-charcoal font-mono-tag text-xs font-semibold hover:bg-paper-warm transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Edit</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pr-2">
              <span className="material-symbols-outlined text-marker-orange text-[18px]">
                stylus_note
              </span>
              <p className="font-script text-2xl text-burnt-orange">
                “you know yourself best.”
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/brain-dump"
        nextTo="/need-sheet"
        nextLabel="Lanjut ke NEED"
        centerLabel="Analisis Cerita"
      />
    </div>
  );
}
