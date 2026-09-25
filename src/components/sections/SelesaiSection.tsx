"use client";

import React from "react";
import Link from "next/link";
import { useJournalStore } from "@/store/useJournalStore";

export function SelesaiSection() {
  const { resetSession, clearAllData } = useJournalStore();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper-base tactile-dot-grid relative selection:bg-marker-orange">
      <header className="relative z-20 w-full bg-paper-base border-b-[1.5px] border-ink-charcoal shadow-[0px_2px_0px_#171717] sticky top-0">
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1120px] mx-auto py-3.5">
          <Link
            href="/"
            className="font-headline text-lg font-bold tracking-tight text-ink-charcoal uppercase flex items-center gap-2 hover:text-burnt-orange transition-colors"
          >
            <span className="w-3.5 h-3.5 bg-marker-orange border-[1.5px] border-ink-charcoal rotate-45 inline-block shadow-[1px_1px_0px_#171717]"></span>
            UNMASKED
          </Link>
          <div className="flex items-center gap-2 bg-paper-warm border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-sticker-sage animate-pulse"></span>
            <span className="font-mono-tag text-xs text-ink-charcoal tracking-wider uppercase font-semibold">
              Ruang Selesai
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[1120px] mx-auto px-6 md:px-12 py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl p-3 shadow-[5px_5px_0px_#171717] w-full max-w-[480px]">
              <div className="relative overflow-hidden rounded-xl border-[1.5px] border-ink-charcoal aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Selesai refleksi"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYriWHN4VHrcP7eQo9YSatwWYmKLvhY4hRriGzHxGCap2OT-VXajNCrkP6O8R-07XSmbOw8WxE7Xho40Yltr5AW26VJwiSoeozjgqQ9N9DVp2S_4PRmK30ta8dEVP6JBah6lBYTB8nCtXobNwE8xClqw3yUKK7KWRAYrXJiOG_cTFdPdnRyWTS-AN4zNmfH06f-2ZjsmwbTET9SfErhJxMY5BpSo3jqiribNYB5RkB9nENJ6WvRI0b6g"
                />
              </div>
              <div className="mt-2.5 pt-2 border-t-[1.5px] border-dashed border-ink-charcoal/30 flex justify-between items-center font-mono-tag text-xs text-ink-charcoal/80">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                  Buku Refleksi Harian
                </span>
                <span>Sesi #04 Selesai</span>
              </div>

              <div className="absolute -top-3 -left-3 bg-sticker-sage text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] px-3 py-1 rounded-full flex items-center gap-1 -rotate-3">
                <span className="material-symbols-outlined text-[16px] font-bold">check_circle</span>
                <span className="font-mono-tag text-xs uppercase font-bold">Tercatat</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 self-start bg-paper-warm border-[1.5px] border-ink-charcoal px-3 py-1 rounded-full shadow-[2px_2px_0px_#171717]">
              <span className="material-symbols-outlined text-[16px] text-burnt-orange">spa</span>
              <span className="font-mono-tag text-xs uppercase text-ink-charcoal font-bold tracking-wider">
                Momen Hening Terpenuhi
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
                “kamu sudah menyelesaikan sesi refleksi.”
              </h1>
              <p className="text-base text-ink-charcoal/80 leading-relaxed max-w-lg">
                Terima kasih sudah meluangkan waktu untuk berhenti sejenak dan mendengarkan dirimu
                sendiri.
              </p>
            </div>

            <div className="inline-block bg-[#FFF4EB] border-[1.5px] border-ink-charcoal rounded-xl px-5 py-3 shadow-[3px_3px_0px_#171717] rotate-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-marker-orange text-[20px]">draw</span>
                <span className="font-script text-2xl md:text-3xl text-burnt-orange font-bold">
                  “one small step is still a step.”
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
              <div className="bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-3 shadow-[2px_2px_0px_#171717]">
                <span className="block font-mono-tag text-[10px] text-ink-charcoal/70 uppercase">
                  Waktu
                </span>
                <span className="font-headline text-lg font-bold text-ink-charcoal">12 Menit</span>
              </div>
              <div className="bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-3 shadow-[2px_2px_0px_#171717]">
                <span className="block font-mono-tag text-[10px] text-ink-charcoal/70 uppercase">
                  Fokus
                </span>
                <span className="font-headline text-lg font-bold text-ink-charcoal">Lega</span>
              </div>
              <div className="bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-3 shadow-[2px_2px_0px_#171717]">
                <span className="block font-mono-tag text-[10px] text-ink-charcoal/70 uppercase">
                  Rangkaian
                </span>
                <span className="font-headline text-lg font-bold text-marker-orange">
                  Hari ke-4
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 max-w-xl">
              <Link
                href="/onboarding"
                onClick={() => resetSession()}
                className="inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-2.5 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
              >
                <span>Mulai Refleksi Baru</span>
                <span className="material-symbols-outlined text-[16px]">refresh</span>
              </Link>
              <Link
                href="/"
                onClick={() => resetSession()}
                className="inline-flex items-center justify-center gap-2 bg-paper-base text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] rounded-full px-5 py-2.5 font-mono-tag text-xs font-semibold hover:bg-paper-warm transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                <span>Kembali ke Beranda</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Hapus semua data refleksi dan jejak di perangkat ini? Ini sangat disarankan jika kamu menggunakan perangkat umum/bersama."
                    )
                  ) {
                    clearAllData();
                    window.location.href = "/";
                  }
                }}
                className="inline-flex items-center justify-center gap-2 bg-paper-warm hover:bg-sticker-pink/40 text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] rounded-full px-4 py-2.5 font-mono-tag text-xs font-semibold transition-all"
                title="Hapus penyimpanan lokal perangkat untuk privasi"
              >
                <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                <span>Hapus Jejak Perangkat</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-[1120px] mx-auto px-6 md:px-12 py-5 border-t border-ink-charcoal/20 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-charcoal/70 gap-2 font-mono-tag">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-sticker-sage">lock</span>
          <span>Catatan tersimpan lokal di perangkatmu · Privasi terjaga</span>
        </div>
        <div className="flex items-center gap-1 font-script text-base text-ink-charcoal">
          <span>Tarik napas dalam, hembuskan perlahan.</span>
        </div>
      </footer>
    </div>
  );
}
