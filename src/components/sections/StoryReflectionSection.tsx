"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { UserConfirmationCard } from "@/components/UserConfirmationCard";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import { LoadInsight } from "@/types/session";

export function StoryReflectionSection() {
  const router = useRouter();
  const isHydrated = useStoreHydrated();
  const isFetchingRef = useRef(false);

  const {
    brainDump,
    stickyNotes,
    publicTags,
    actualFeelings,
    maskInsight,
    maskConfirmation,
    loadInsight,
    setLoadInsight,
    loadConfirmation,
    setLoadConfirmation,
  } = useJournalStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBrainDump = brainDump.trim().length > 0 || stickyNotes.length > 0;
  const currentBrainDump =
    brainDump.trim() ||
    stickyNotes.map((n) => n.text).filter(Boolean).join(". ");

  const fetchLoadAnalysis = async (force = false) => {
    if (loadInsight && !force) return;
    if (!hasBrainDump) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brainDump: currentBrainDump,
          items: stickyNotes.map((n) => ({
            id: n.id,
            text: n.text,
            category: n.category || "act",
          })),
          maskContext: {
            publicTags,
            actualFeelings,
            reflection: maskInsight?.reflection,
            confirmation: maskConfirmation || undefined,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menganalisis curahan pikiran.");
      }

      setLoadInsight(json.data as LoadInsight);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menelaah beban.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (loadInsight) return;
    if (!hasBrainDump) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    fetchLoadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, loadInsight, hasBrainDump]);

  if (isHydrated && !hasBrainDump && !loadInsight) {
    return (
      <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
        <Header subtitle="LOAD 02/02" showSteps={true} stepNumber={2} totalSteps={4} />
        <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-paper-base border-[2px] border-ink-charcoal rounded-2xl p-6 sm:p-8 text-center shadow-[6px_6px_0px_#171717]">
            <div className="w-14 h-14 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-marker-orange text-3xl">edit_note</span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-ink-charcoal mb-2">
              Curahan Pikiran Masih Kosong
            </h2>
            <p className="font-sans text-xs sm:text-sm text-ink-charcoal/80 mb-6 leading-relaxed">
              Kamu belum menuliskan curahan beban pikiran di tahap Brain Dump. Tuliskan apa yang sedang kamu rasakan agar telaah ini relevan untukmu.
            </p>
            <Link
              href="/brain-dump"
              className="inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-2.5 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Tulis di Brain Dump</span>
            </Link>
          </div>
        </main>
        <BottomDock backTo="/brain-dump" centerLabel="Curahan Masih Kosong" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-36 sm:pb-28">
      <Header subtitle="LOAD 02/02" showSteps={true} stepNumber={2} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-[780px] text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] mb-3">
            <span className="w-2 h-2 rounded-full bg-marker-orange animate-pulse"></span>
            <span className="font-mono-tag text-xs uppercase font-semibold text-ink-cocoa">
              Tahap: LOAD / Telaah Beban Batin
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-ink-charcoal lowercase mb-2">
            “ini yang kami tangkap dari ceritamu.”
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-ink-charcoal/80 max-w-[620px] mx-auto">
            Kami mencoba merapikan apa yang kamu tulis menjadi beberapa hal yang mungkin sedang kamu bawa saat ini.
          </p>
        </div>

        <div className="w-full max-w-[780px] bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[6px_6px_0px_#171717] relative overflow-hidden">
          <div className="bg-paper-warm border-b-[1.5px] border-ink-charcoal px-5 py-2.5 flex items-center justify-between font-mono-tag text-xs text-ink-charcoal/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-sticker-pink"></span>
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-marker-orange"></span>
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-sticker-sage"></span>
              <span className="ml-1 font-semibold">telaah_beban_refleksi.md</span>
            </div>
            <span className="text-[11px] font-semibold text-burnt-orange">Refleksi Cermin</span>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">
            {loading && <MindfulLoading message="Sedang mengurai benang kusut curahan pikiranmu..." />}

            {error && (
              <div className="p-4 bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-xl text-center space-y-2">
                <p className="text-sm font-headline text-ink-charcoal font-bold">
                  Gagal memuat telaah AI: {error}
                </p>
                <button
                  type="button"
                  onClick={() => fetchLoadAnalysis(true)}
                  className="px-4 py-1.5 bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold rounded-full border border-ink-charcoal shadow-[2px_2px_0px_#171717]"
                >
                  Coba Analisis Ulang
                </button>
              </div>
            )}

            {!loading && loadInsight && (
              <>
                {/* 1. BEBAN INTI (SUMMARY) */}
                <div>
                  <div className="font-mono-tag text-xs font-bold text-ink-charcoal flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 bg-marker-orange inline-block"></span>
                    1. INTI BEBAN YANG SEDANG DIPIKUL
                  </div>
                  <div className="bg-paper-warm/90 border-[1.5px] border-ink-charcoal rounded-lg p-4 md:p-5 shadow-[3px_3px_0px_#171717]">
                    <blockquote className="text-sm md:text-base text-ink-charcoal italic font-medium leading-relaxed pl-2 border-l-[3px] border-marker-orange">
                      “{loadInsight.summary}”
                    </blockquote>
                  </div>
                </div>

                {/* 2. TEMA-TEMA UTAMA */}
                <div>
                  <div className="font-mono-tag text-xs font-bold text-ink-charcoal flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 bg-sticker-blue inline-block"></span>
                    2. TEMA YANG MUNCUL
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {loadInsight.themes.map((theme, i) => (
                      <div
                        key={i}
                        className="inline-flex flex-col gap-1 px-3.5 py-1.5 rounded-xl bg-sticker-blue/30 border-[1.5px] border-ink-charcoal font-mono-tag text-xs text-ink-charcoal shadow-[2px_2px_0px_#171717]"
                      >
                        <span className="font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">label</span>
                          {theme.name}
                        </span>
                        {theme.description && (
                          <span className="text-[11px] text-ink-charcoal/75 max-w-xs">
                            {theme.description}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. KONTEKS EMOSIONAL & POLA */}
                <div>
                  <div className="font-mono-tag text-xs font-bold text-ink-charcoal flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 bg-sticker-sage inline-block"></span>
                    3. KONTEKS EMOSIONAL & POLA YANG TERBENTUK
                  </div>

                  {/* Emotional chips */}
                  <div className="flex flex-wrap gap-2 items-center mb-3">
                    {loadInsight.emotionalContext.map((em, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-semibold text-burnt-orange shadow-[1px_1px_0px_#171717]"
                      >
                        {em.label}
                      </span>
                    ))}
                  </div>

                  {/* Patterns */}
                  {loadInsight.patterns.map((p, i) => (
                    <div
                      key={i}
                      className="p-3 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl text-xs sm:text-sm text-ink-charcoal shadow-[2px_2px_0px_#171717] mb-2"
                    >
                      <span className="font-mono-tag text-[10px] uppercase font-bold text-marker-orange block mb-0.5">
                        Pola Batin:
                      </span>
                      {p.description}
                    </div>
                  ))}
                </div>

                {/* 4. PERTANYAAN FOKUS (JIKA ADA) */}
                {loadInsight.question && (
                  <div className="bg-[#FFFDF9] border-[1.5px] border-ink-charcoal rounded-xl p-4 shadow-[2px_2px_0px_#171717]">
                    <span className="font-mono-tag text-xs font-bold text-burnt-orange uppercase block mb-1">
                      Pertanyaan untuk Memperjelas:
                    </span>
                    <p className="font-headline italic text-sm sm:text-base text-ink-charcoal">
                      “{loadInsight.question}”
                    </p>
                  </div>
                )}

                {/* USER CONFIRMATION CARD */}
                <UserConfirmationCard
                  currentConfirmation={loadConfirmation}
                  onConfirm={(conf) => setLoadConfirmation(conf)}
                  title="Apakah rangkuman tema & beban ini sesuai dengan ceritamu?"
                  subtitle="Jika ada bagian yang kurang tepat atau ingin kamu luruskan, kamu memegang kendali penuh."
                />
              </>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-ink-charcoal/15">
              <button
                type="button"
                onClick={() => router.push("/brain-dump")}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full border-[1.5px] border-ink-charcoal bg-paper-base text-ink-charcoal font-mono-tag text-xs font-semibold hover:bg-paper-warm transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Edit Tulisan Brain Dump</span>
              </button>

              <div className="flex items-center justify-center sm:justify-end gap-1.5 pr-2">
                <span className="material-symbols-outlined text-marker-orange text-[18px]">
                  stylus_note
                </span>
                <p className="font-script text-xl text-burnt-orange font-bold">
                  “you know yourself best.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/brain-dump"
        nextTo="/need-sheet"
        nextLabel="Lanjut ke NEED"
        centerLabel="Analisis Beban Selesai"
      />
    </div>
  );
}
