"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import confetti from "canvas-confetti";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Header } from "@/components/Header";

export function CompletionSection() {
  const router = useRouter();
  const { resetSession, clearAllData, sessionId, actualFeelings, loadInsight } = useJournalStore();
  const isHydrated = useStoreHydrated();
  const [showConfirm, setShowConfirm] = useState(false);

  const sessionStartTime = parseInt(sessionId.split("-")[1] || "0");
  const [now, setNow] = useState<number | null>(null);

  const minutesSpent = isHydrated && sessionStartTime > 0 && now
    ? Math.max(1, Math.round((now - sessionStartTime) / 60000))
    : 1;

  const mainFocus = loadInsight?.themes?.[0]?.name || actualFeelings?.[0] || "Refleksi Diri";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const colors = ["#F4B393", "#9B8E7B", "#F6D9D5", "#171717"]; // theme colors

    // Tembakan dari sisi kiri
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors: colors
    });

    // Tembakan dari sisi kanan
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      colors: colors
    });
  }, []);

  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Hindari trigger jika yang diklik adalah tombol/link
    if (target.closest('button') || target.closest('a')) return;

    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    confetti({
      particleCount: 15,
      spread: 50,
      origin: { x, y },
      colors: ["#F4B393", "#9B8E7B", "#F6D9D5", "#171717"],
      startVelocity: 15,
      ticks: 50,
      gravity: 0.9,
      scalar: 0.8,
      zIndex: 40
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-paper-base tactile-dot-grid relative selection:bg-marker-orange"
      onClick={handlePageClick}
    >
      <Header subtitle="RANGKUMAN" />

      <main className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl p-3 shadow-[5px_5px_0px_#171717] w-full max-w-[480px]">
              <div className="relative overflow-hidden rounded-xl border-[1.5px] border-ink-charcoal aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Selesai refleksi"
                  className="w-full h-full object-cover"
                  src="/images/study-desk-2.png"
                />
              </div>
              <div className="mt-2.5 pt-2 border-t-[1.5px] border-dashed border-ink-charcoal/30 flex justify-between items-center font-mono-tag text-xs text-ink-charcoal/80">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                  Buku Refleksi Harian
                </span>
                <span>Sesi Selesai</span>
              </div>

              <div className="absolute -top-3 -left-3 bg-sticker-sage text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] px-3 py-1 rounded-full flex items-center gap-1 -rotate-3">
                <span className="material-symbols-outlined text-[16px] font-bold">check_circle</span>
                <span className="font-mono-tag text-xs uppercase font-bold">Tercatat</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 self-start bg-sticker-sage text-ink-charcoal border-[2px] border-dashed border-ink-charcoal px-3 py-1.5 shadow-[3px_3px_0px_#171717] mb-2">
              <span className="material-symbols-outlined text-[16px] font-bold">task_alt</span>
              <span className="font-mono-tag text-[10px] uppercase font-extrabold tracking-widest">
                Sesi Berakhir
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
                ”kamu sudah menyelesaikan sesi refleksi.”
              </h1>
              <p className="text-base text-ink-charcoal/80 leading-relaxed max-w-lg">
                Terima kasih sudah meluangkan waktu untuk berhenti sejenak dan mendengarkan dirimu
                sendiri.
              </p>
            </div>

            <div className="inline-block bg-[#FFF4EB] border-[1.5px] border-ink-charcoal text-center rounded-xl px-5 py-3 shadow-[3px_3px_0px_#171717] rotate-1">
              <span className="font-script text-2xl md:text-3xl text-burnt-orange font-bold text-center">
                “one small step is still a step.”
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-white border-[1.5px] border-ink-charcoal rounded-md px-3 py-2 shadow-[2px_2px_0px_#171717]">
                <span className="material-symbols-outlined text-[16px] text-ink-charcoal/70">schedule</span>
                <span className="font-mono-tag text-xs font-bold uppercase">{minutesSpent} Menit</span>
              </div>
              <div className="flex items-center gap-2 bg-white border-[1.5px] border-ink-charcoal rounded-md px-3 py-2 shadow-[2px_2px_0px_#171717]">
                <span className="material-symbols-outlined text-[16px] text-ink-charcoal/70">center_focus_strong</span>
                <span className="font-mono-tag text-xs font-bold uppercase truncate max-w-[200px] sm:max-w-[250px]" title={mainFocus}>
                  {mainFocus}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 max-w-xl">
              <Link
                href="/onboarding"
                onClick={() => resetSession()}
                className="inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-2.5 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
              >
                <span>Mulai Refleksi Baru</span>
                <span className="material-symbols-outlined text-[16px]">refresh</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-paper-base text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] rounded-full px-5 py-2.5 font-mono-tag text-xs font-semibold hover:bg-paper-warm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                <span>Kembali ke Beranda</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="inline-flex items-center justify-center gap-2 bg-paper-base hover:bg-sticker-pink text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] rounded-full px-4 py-2.5 font-mono-tag text-xs font-semibold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150"
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

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          clearAllData();
          router.push("/");
        }}
        title="Hapus Jejak Perangkat?"
        description="Ini akan menghapus semua data refleksi dan jejak di perangkat ini. Sangat disarankan jika kamu menggunakan perangkat umum/bersama."
        confirmText="Ya, Hapus"
      />
    </div>
  );
}
