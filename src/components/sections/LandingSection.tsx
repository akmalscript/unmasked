"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

export function LandingSection() {
  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden bg-paper-base selection:bg-secondary-fixed">
      <div className="pointer-events-none absolute inset-0 tactile-dot-grid opacity-30"></div>

      <header className="relative z-20 w-full bg-paper-base border-b-[1.5px] border-ink-charcoal shadow-[0px_2px_0px_#171717] sticky top-0">
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1120px] mx-auto py-3.5">
          <Link
            className="font-headline text-xl font-bold tracking-tight text-ink-charcoal uppercase hover:text-burnt-orange transition-colors flex items-center gap-2"
            href="/"
          >
            <span className="w-3.5 h-3.5 bg-marker-orange border-[1.5px] border-ink-charcoal rotate-45 inline-block shadow-[1px_1px_0px_#171717]"></span>
            UNMASKED
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              className="font-mono-tag text-xs text-ink-charcoal/80 hover:text-burnt-orange transition-colors"
              href="/onboarding"
            >
              Cara Kerja
            </Link>
            <Link
              className="font-mono-tag text-xs text-ink-charcoal/80 hover:text-burnt-orange transition-colors"
              href="/checkin"
            >
              Tentang Ruang
            </Link>
          </nav>
          <Link
            className="flex items-center gap-1.5 font-mono-tag text-xs md:text-sm font-semibold bg-paper-warm text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] rounded-full px-5 py-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            href="/onboarding"
          >
            <span>Mulai Refleksi</span>
            <span className="text-marker-orange font-bold text-base leading-none">→</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-grow flex items-center w-full max-w-[1120px] mx-auto px-6 md:px-12 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          <div className="lg:col-span-6 flex flex-col justify-center relative">
            <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-md shadow-[2px_2px_0px_#171717] -rotate-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-marker-orange"></span>
              <span className="font-mono-tag text-[10px] uppercase tracking-wider text-ink-charcoal">
                Jurnal Reflektif Harian
              </span>
            </div>

            <h1 className="font-headline text-4xl sm:text-5xl lg:text-[54px] font-bold text-ink-charcoal tracking-tight leading-tight mb-5">
              Beyond{" "}
              <span className="relative inline-block text-ink-charcoal underline decoration-marker-orange decoration-[4px] underline-offset-4">
                “I&apos;m Fine.”
              </span>
            </h1>

            <p className="text-lg text-ink-charcoal/80 max-w-lg mb-8 leading-relaxed">
              Ruang aman untuk berhenti sejenak, mengurai isi pikiran, dan memahami apa yang sebenarnya
              kamu butuhkan tanpa tuntutan untuk selalu baik-baik saja.
            </p>

            <div className="relative flex flex-col items-start gap-4">
              <div className="relative inline-flex items-center">
                <Link
                  className="inline-flex items-center gap-2 font-mono-tag text-sm bg-paper-warm text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-7 py-3.5 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all font-bold"
                  href="/onboarding"
                >
                  <span>Mulai Refleksi</span>
                  <span className="text-marker-orange font-bold text-lg leading-none">→</span>
                </Link>

                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 pointer-events-none select-none -rotate-3">
                  <svg
                    className="w-8 h-8 text-marker-orange flex-shrink-0 -scale-y-100"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 32 32"
                  >
                    <path d="M26 12 C 18 8, 12 18, 6 16"></path>
                    <path d="M10 12 L 6 16 L 10 20"></path>
                  </svg>
                  <span className="font-script text-2xl font-bold text-marker-orange whitespace-nowrap pt-1">
                    “just start.”
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-ink-charcoal/70">
                <span className="material-symbols-outlined text-[16px] text-marker-orange">
                  schedule
                </span>
                <span className="font-mono-tag text-xs">
                  10–15 menit · tidak ada jawaban benar atau salah
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex items-center justify-center pt-4 pb-6 lg:py-0">
            <div className="relative w-full max-w-[450px]">
              <div className="absolute inset-0 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-2xl rotate-2 translate-x-2 translate-y-2 pointer-events-none"></div>

              <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl p-2.5 shadow-[6px_6px_0px_#171717] overflow-visible">
                <div className="overflow-hidden rounded-xl aspect-[4/3] sm:aspect-[5/4] bg-surface-variant">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Reflektif dan tenang"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7fcF3HQQlrdz3qMIIctd1lClJEIhQbrapWgBmrRXuB4LQrKet21kZScIRb4slE7-V522Fa866VTcAnA-Bp4bP0Zz4WnnDq6KmvRp_DHM2zNI-N-jM9lnsLFvtG34eq380LEK2TyNKkDopD-3MxJTmB_Zr7WHlTJ2FKGrFPOns8ycYiJMcdMsJWWIV2q8q0w8nfK_4-bpGGir_bD7E24IVEHQm6-LS6cc1tfY7BYFdsAWorguYcY4Trg"
                  />
                </div>

                <div className="absolute -top-4 -left-3 px-3 py-1.5 bg-sticker-pink border-[1.5px] border-ink-charcoal rounded-full shadow-[2px_2px_0px_#171717] -rotate-6 flex items-center gap-1.5 select-none pointer-events-none">
                  <span
                    className="material-symbols-outlined text-sm text-ink-charcoal"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                  <span className="font-mono-tag text-xs text-ink-charcoal font-bold tracking-tight">
                    rasakan
                  </span>
                </div>

                <div className="absolute -bottom-3 left-6 px-3.5 py-1 bg-sticker-sage border-[1.5px] border-ink-charcoal rounded-lg shadow-[3px_3px_0px_#171717] rotate-3 flex items-center gap-1.5 select-none pointer-events-none">
                  <span
                    className="material-symbols-outlined text-base text-ink-charcoal"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    spa
                  </span>
                  <span className="font-mono-tag text-[11px] text-ink-charcoal uppercase font-bold tracking-wider">
                    napas tenang
                  </span>
                </div>

                <div className="absolute -top-3 -right-2 p-2 bg-secondary-fixed border-[1.5px] border-ink-charcoal rounded-full shadow-[2px_2px_0px_#171717] rotate-12 flex items-center justify-center select-none pointer-events-none">
                  <span
                    className="material-symbols-outlined text-lg text-ink-charcoal"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    light_mode
                  </span>
                </div>

                <div className="absolute -bottom-7 -right-3 md:-right-6 bg-paper-warm border-[1.5px] border-ink-charcoal px-4 py-2 rounded-xl shadow-[3px_3px_0px_#171717] rotate-3 select-none pointer-events-none max-w-[210px]">
                  <p className="font-script text-xl text-burnt-orange font-bold leading-tight">
                    “you don&apos;t have to carry it all.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full bg-paper-base border-t-[1.5px] border-ink-charcoal py-4 px-6 md:px-12">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 font-mono-tag text-xs text-ink-charcoal/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-marker-orange inline-block"></span>
            <p>UNMASKED JOURNAL — RUANG SANTAI & REFLEKSI MANDIRI</p>
          </div>
          <p>Privasi Penuh · Tanpa Algoritma Menilai</p>
        </div>
      </footer>
    </div>
  );
}
