"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

export function CheckinSection() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper-base tactile-dot-grid relative">
      <Header subtitle="ONBOARDING" showSteps={true} stepNumber={1} totalSteps={4} />

      <main className="flex-grow flex flex-col justify-center items-center px-6 md:px-12 py-10 max-w-[1120px] mx-auto w-full relative">
        <div className="text-center max-w-2xl mx-auto mb-10 relative">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-charcoal mb-3">
            Sebelum Kita Mulai...
          </h1>
          <p className="mt-3 text-base md:text-lg text-ink-charcoal/80 leading-relaxed max-w-2xl mx-auto">
            UNMASKED adalah ruang refleksi untuk membantumu memahami diri sendiri, <br className="hidden sm:block" />
            bukan layanan diagnosis atau pengganti tenaga profesional.
          </p>
        </div>

        {/* <div className="w-full max-w-md mb-10 relative flex items-center justify-center">
          <div className="absolute -inset-4 bg-tertiary-fixed/30 rounded-3xl blur-xl -z-10"></div>
          <div className="relative bg-paper-warm border-[1.5px] border-ink-charcoal rounded-2xl p-5 shadow-[5px_5px_0px_#171717] w-full flex items-center gap-5 overflow-hidden">
            <div className="w-24 h-24 shrink-0 rounded-xl border-[1.5px] border-ink-charcoal overflow-hidden bg-paper-base shadow-[2px_2px_0px_#171717]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* <img
                className="w-full h-full object-cover"
                alt="Journaling"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4Vnh2OF4yDfWE2l3IivBjZ5H24PMa_4isQNqvfGzTBoIOsqSA_n43nRDo0K7ry50bxE-aqZeiprZEWpCDP5Y0AKexoKB9QTI9x6l9KF6FteUsQogsLvUmFxHKseew5Y9JHOZrfCUFQefXjuY2UbKLh0k28l2Zf2XxZ_H83rRfOT_NfcnksAO3EqxiBX_pC1d6uey9OwOVNw3xWoQ9zrK5SZorPQYvJn9jZFe_1__2quEwEjMrTncI8g"
              />
            </div>
            <div className="flex flex-col justify-center pr-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-marker-orange border border-ink-charcoal"></span>
                <span className="font-mono-tag text-xs font-semibold uppercase text-ink-cocoa">
                  ruang amanmu
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-charcoal leading-snug">
                Tidak perlu terburu-buru. Catatan ini privat dan hanya ada untukmu.
              </p>
            </div>
            <div className="absolute -top-2.5 right-8 w-16 h-5 bg-sticker-pink/80 border-[1.5px] border-ink-charcoal rotate-6 pointer-events-none"></div>
          </div> */}
        {/*</div> */}

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 max-w-4xl">
          <div className="bg-paper-base border-[1.5px] border-ink-charcoal p-5 rounded-xl shadow-[4px_4px_0px_#171717] md:-rotate-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[1px_1px_0px_#171717]">
                <span className="material-symbols-outlined text-burnt-orange text-lg">timer</span>
              </div>
              <span className="font-mono-tag text-xs text-ink-charcoal/60">01</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-ink-charcoal mb-1">10–15 menit</h3>
            <p className="text-xs sm:text-sm text-ink-charcoal/75">
              waktu cukup untuk merenung sejenak
            </p>
          </div>

          <div className="bg-paper-warm border-[1.5px] border-ink-charcoal p-5 rounded-xl shadow-[4px_4px_0px_#171717]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-paper-base border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[1px_1px_0px_#171717]">
                <span className="material-symbols-outlined text-burnt-orange text-lg">favorite</span>
              </div>
              <span className="font-mono-tag text-xs text-ink-charcoal/60">02</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-ink-charcoal mb-1">
              tidak ada jawaban salah
            </h3>
            <p className="text-xs sm:text-sm text-ink-charcoal/75">kamu tidak perlu khawatir</p>
          </div>

          <div className="bg-paper-base border-[1.5px] border-ink-charcoal p-5 rounded-xl shadow-[4px_4px_0px_#171717] md:rotate-1">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[1px_1px_0px_#171717]">
                <span className="material-symbols-outlined text-marker-orange text-lg">
                  pause_circle
                </span>
              </div>
              <span className="font-mono-tag text-xs text-ink-charcoal/60">03</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-ink-charcoal mb-1">
              berhenti kapan saja
            </h3>
            <p className="text-xs sm:text-sm text-ink-charcoal/75">kamu bisa berhenti kapanpun</p>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row-reverse items-center justify-between gap-4 mt-2">
          <Link href="/public-self" className="w-full sm:w-auto px-6 py-2.5 bg-marker-orange text-ink-charcoal font-headline text-base font-bold border-[1.5px] border-ink-charcoal rounded-full shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-[1px_1px_0px_#171717] inline-flex items-center justify-center gap-2">
            <span>Lanjutkan</span>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </Link>
          <Link href="/" className="w-full sm:w-auto px-6 py-2.5 bg-paper-base text-ink-charcoal font-headline text-base font-bold border-[1.5px] border-ink-charcoal rounded-full shadow-[3px_3px_0px_#171717] hover:shadow-[5px_5px_0px_#171717] transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-[1px_1px_0px_#171717] inline-flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span>Kembali</span>
          </Link>
        </div>
      </main>

      <footer className="relative z-10 w-full bg-paper-base border-t-[1.5px] border-ink-charcoal py-6 px-6 md:px-12 mt-auto">
        <div className="w-full max-w-[1120px] mx-auto flex justify-start">
          <p className="text-xs text-ink-charcoal/60 font-mono-tag">
            &copy; {new Date().getFullYear()} Unmasked. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
