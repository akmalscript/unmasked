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
              href="/onboarding"
            >
              Tentang Ruang
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[1.5px] border-ink-charcoal bg-surface text-ink-cocoa font-mono-tag text-xs shadow-[2px_2px_0px_#171717] hover:bg-paper-warm active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#171717] transition-all"
              href="/summary"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Arsip Jurnal</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow flex items-center w-full max-w-[1120px] mx-auto px-6 md:px-12 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          <div className="lg:col-span-6 flex flex-col justify-center relative">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-marker-orange/15 border-[1.5px] border-ink-charcoal text-ink-cocoa mb-6 shadow-[2px_2px_0px_#171717] -rotate-1">
              <span className="w-2 h-2 rounded-full bg-marker-orange"></span>
              <span className="font-mono-tag text-xs font-semibold tracking-wider uppercase">jurnal relfektif harian</span>
            </div>

            <h1 className="font-headline text-4xl sm:text-5xl lg:text-[54px] font-bold text-ink-charcoal tracking-tight leading-tight mb-5">
              Beyond{" "}
              <span className="relative inline-block text-burnt-orange italic">
                {"“I'm Fine.”"}
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-marker-orange/60" preserveAspectRatio="none" viewBox="0 0 100 12">
                  <path d="M0,8 Q50,0 100,7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                </svg>
              </span>
            </h1>

            <p className="text-lg text-ink-charcoal/80 max-w-lg mb-8 leading-relaxed">
              Ruang untuk memahami apa yang sebenarnya kamu butuhkan.
            </p>

            <div className="relative flex flex-col items-start gap-4 mt-4">
              <div className="relative inline-flex items-center">
                <Link
                  className="inline-flex items-center justify-center gap-3 w-[180px] font-mono-tag text-sm bg-paper-warm text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-7 py-3.5 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all font-bold"
                  href="/onboarding"
                >
                  <span>Mulai</span>
                  <span className="text-ink-charcoal font-bold text-lg leading-none">→</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-ink-charcoal/70 mt-2">
                <span
                  className="material-symbols-outlined text-marker-orange"
                  style={{ fontSize: '19px' }}
                >
                  schedule
                </span>
                <span className="font-mono-tag text-[13px] mt-[1px]">
                  Selesai Dalam 10 Menit
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

                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 bg-sticker-pink/85 border border-ink-charcoal/20 px-6 py-1 rotate-[-1.5deg] border-x-2 border-dashed backdrop-blur-sm">
                  <span className="font-mono-tag text-[10px] uppercase font-semibold text-ink-charcoal/80 tracking-widest"></span>
                </div>

                <div className="absolute -top-2 -left-3 z-30 bg-sticker-blue/85 border border-ink-charcoal/15 w-14 h-4 rotate-[-35deg] border-x-2 border-dashed"></div>

                <div className="absolute -bottom-6 -left-4 sm:-left-8 z-30 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-lg p-3.5 max-w-[210px] shadow-[3px_3px_0px_#171717] rotate-[3deg]">
                  <div className="absolute -top-2 left-6 bg-sticker-sage/85 border border-ink-charcoal/20 w-10 h-3 rotate-1 border-x-2 border-dashed"></div>
                  <p className="font-script text-xl font-bold text-burnt-orange leading-snug">
                    {"“you don't have to carry it all.”"}
                  </p>
                  <div className="mt-1 flex justify-end">
                    <span className="text-[11px] font-mono-tag text-ink-cocoa/60"></span>
                  </div>
                </div>

                <div className="absolute -top-5 -right-3 z-30 bg-sticker-pink border-[1.5px] border-ink-charcoal rounded-full w-10 h-10 flex items-center justify-center shadow-[2px_2px_0px_#171717] rotate-12">
                  <span className="material-symbols-outlined text-ink-charcoal text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              </div>
            </div>
          </div>
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
