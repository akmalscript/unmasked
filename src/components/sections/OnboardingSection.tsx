"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";

export function OnboardingSection() {
  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid relative selection:bg-marker-orange">
      <Header subtitle="ONBOARDING" showSteps={false} />

      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 md:px-12 py-8 md:py-16">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-full text-center mb-8 relative">
            <div className="hidden sm:flex absolute -left-10 -top-6 items-center justify-center w-12 h-12 rounded-full bg-sticker-sage border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] -rotate-6">
              <span className="material-symbols-outlined text-ink-charcoal text-[22px]">potted_plant</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl text-ink-charcoal mb-3 tracking-tight font-normal lowercase">
              “sebelum kita mulai...”
            </h1>
            <p className="text-base md:text-lg text-ink-charcoal/80 max-w-xl mx-auto leading-relaxed">
              UNMASKED adalah ruang refleksi untuk membantumu memahami diri sendiri, bukan layanan diagnosis atau pengganti tenaga profesional.
            </p>
          </div>

          <div className="relative w-full bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl shadow-[4px_4px_0px_#171717] p-6 sm:p-8 md:p-10 mb-8">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 washi-tape w-28 h-6 -rotate-1 pointer-events-none z-20 flex items-center justify-center">
              <div className="w-16 h-[1px] bg-outline/20"></div>
            </div>

            <div className="absolute -top-5 -right-3 md:-right-6 -rotate-3 bg-paper-warm border-[1.5px] border-ink-charcoal px-3 py-1 rounded-lg shadow-[2px_2px_0px_#171717] z-20 flex items-center gap-1">
              <span className="font-script text-burnt-orange text-xl md:text-2xl font-bold">
                “no pressure.”
              </span>
              <span className="material-symbols-outlined text-marker-orange text-[16px]">edit</span>
            </div>

            <div className="flex items-center gap-2 mb-6 pb-4 border-b-[1.5px] border-ink-charcoal/10">
              <div className="w-7 h-7 rounded-lg bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[1px_1px_0px_#171717]">
                <span className="material-symbols-outlined text-ink-charcoal text-[16px]">menu_book</span>
              </div>
              <span className="font-mono-tag text-xs uppercase tracking-wider text-ink-charcoal/70 font-semibold">
                Komitmen Privasi & Batasan Ruang
              </span>
            </div>

            <ul className="space-y-3.5 sm:space-y-4">
              <li className="flex items-start gap-3.5 p-3 rounded-xl bg-paper-warm/60 border border-ink-charcoal/15">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-sticker-blue border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[2px_2px_0px_#171717] -rotate-2">
                  <span className="material-symbols-outlined text-ink-charcoal text-[18px]">lock</span>
                </div>
                <div>
                  <span className="font-mono-tag text-xs text-burnt-orange font-bold uppercase block mb-0.5">Kerahasiaan Penuh</span>
                  <p className="text-sm text-ink-charcoal leading-snug">Input kamu bersifat pribadi dan aman di browser.</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 p-3 rounded-xl bg-paper-warm/60 border border-ink-charcoal/15">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-tertiary-fixed border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[2px_2px_0px_#171717] rotate-2">
                  <span className="material-symbols-outlined text-ink-charcoal text-[18px]">lightbulb</span>
                </div>
                <div>
                  <span className="font-mono-tag text-xs text-burnt-orange font-bold uppercase block mb-0.5">Tujuan Sesi</span>
                  <p className="text-sm text-ink-charcoal leading-snug">Kami menggunakan jawabanmu untuk memetakan beban dan langkah kecil.</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 p-3 rounded-xl bg-paper-warm/60 border border-ink-charcoal/15">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-sticker-pink border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[2px_2px_0px_#171717] -rotate-1">
                  <span className="material-symbols-outlined text-ink-charcoal text-[18px]">tune</span>
                </div>
                <div>
                  <span className="font-mono-tag text-xs text-burnt-orange font-bold uppercase block mb-0.5">Kendali di Tanganmu</span>
                  <p className="text-sm text-ink-charcoal leading-snug">Kamu dapat mengoreksi, mengganti kata, atau menolak kesimpulan refleksi.</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 p-3 rounded-xl bg-paper-warm/60 border border-ink-charcoal/15">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-sticker-sage border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[2px_2px_0px_#171717] rotate-1">
                  <span className="material-symbols-outlined text-ink-charcoal text-[18px]">health_and_safety</span>
                </div>
                <div>
                  <span className="font-mono-tag text-xs text-burnt-orange font-bold uppercase block mb-0.5">Dukungan Keselamatan</span>
                  <p className="text-sm text-ink-charcoal leading-snug">Jika terdeteksi rasa kewalahan berat, kami sediakan rujukan kontak bantuan.</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t-[1.5px] border-ink-charcoal/10 flex flex-wrap items-center justify-between text-ink-charcoal/60 font-mono-tag text-xs gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                <span>Terenkripsi lokal di perambanmu</span>
              </div>
              <div className="flex items-center gap-1 font-script text-ink-charcoal text-base">
                <span>santai & mengalir</span>
                <span className="material-symbols-outlined text-[14px]">nature</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomDock nextTo="/checkin" nextLabel="Saya Mengerti, Lanjutkan" centerLabel="~3–5 menit · suasana hening" />
    </div>
  );
}
