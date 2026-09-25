"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { UserConfirmationCard } from "@/components/UserConfirmationCard";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import { NeedInsight } from "@/types/session";

export function NeedResultSection() {
  const isHydrated = useStoreHydrated();
  const isFetchingRef = useRef(false);

  const {
    publicTags,
    actualFeelings,
    maskConfirmation,
    brainDump,
    loadInsight,
    loadConfirmation,
    needCandidates,
    needQuestions,
    needAnswers,
    needInsight,
    setNeedInsight,
    needConfirmation,
    setNeedConfirmation,
  } = useJournalStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasNeedInput = needCandidates.length > 0 || needAnswers.length > 0;

  const fetchNeedSynthesis = async (force = false) => {
    if (needInsight && !force) return;
    if (!hasNeedInput) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/need/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maskContext: {
            publicTags,
            actualFeelings,
            userCorrection: maskConfirmation?.correction,
          },
          loadContext: {
            themes: loadInsight?.themes?.map((t) => t.name) || [],
            summary: loadInsight?.summary || brainDump.trim() || "Kondisi batin yang memerlukan perhatian.",
            userCorrection: loadConfirmation?.correction,
          },
          candidates: needCandidates,
          questions: needQuestions,
          answers: needAnswers,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyintesis kebutuhan.");
      }

      setNeedInsight(json.data as NeedInsight);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (needInsight) return;
    if (!hasNeedInput) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    fetchNeedSynthesis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, needInsight, hasNeedInput]);

  if (isHydrated && !hasNeedInput && !needInsight) {
    return (
      <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
        <Header subtitle="NEED 02/02" showSteps={true} stepNumber={3} totalSteps={4} />
        <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-paper-base border-[2px] border-ink-charcoal rounded-2xl p-6 sm:p-8 text-center shadow-[6px_6px_0px_#171717]">
            <div className="w-14 h-14 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-marker-orange text-3xl">help_center</span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-ink-charcoal mb-2">
              Pertanyaan Belum Terjawab
            </h2>
            <p className="font-sans text-xs sm:text-sm text-ink-charcoal/80 mb-6 leading-relaxed">
              Kamu belum menjawab pertanyaan refleksi di tahap NEED. Jawab pertanyaan terlebih dahulu agar kebutuhan intimu dapat dipetakan secara akurat.
            </p>
            <Link
              href="/need-sheet"
              className="inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-2.5 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Jawab Pertanyaan Refleksi</span>
            </Link>
          </div>
        </main>
        <BottomDock backTo="/need-sheet" centerLabel="Jawaban Masih Kosong" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="NEED 02/02" showSteps={true} stepNumber={3} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-8 md:py-12">
        {/* Header - Revised per Section 26 */}
        <div className="max-w-3xl mb-8">
          <p className="font-mono-tag text-xs font-bold text-burnt-orange uppercase tracking-wider mb-1">
            YANG MUNGKIN KAMU BUTUHKAN
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
            “hal yang mungkin paling kamu butuhkan sekarang”
          </h1>
          <p className="text-sm md:text-base text-ink-charcoal/80 mt-2">
            Dari semua yang kamu ceritakan dan jawab, ini yang tampaknya paling relevan untuk diperhatikan sekarang.
          </p>
        </div>

        {loading && <MindfulLoading message="Sedang menyelaraskan hasil refleksi dari ceritamu..." />}

        {error && (
          <div className="p-5 bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-xl text-center space-y-2 mb-8">
            <p className="text-sm font-headline text-ink-charcoal font-bold">
              Gagal memuat hasil: {error}
            </p>
            <button
              type="button"
              onClick={() => fetchNeedSynthesis(true)}
              className="px-4 py-1.5 bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold rounded-full border border-ink-charcoal shadow-[2px_2px_0px_#171717]"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && needInsight && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Need Card - Revised per Section 27, 28, 29, 30, 31 */}
            <div className="lg:col-span-7 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-6 md:p-8 shadow-[5px_5px_0px_#171717]">
              <div className="flex items-center justify-between pb-3 mb-5 border-b-[1.5px] border-ink-charcoal font-mono-tag text-xs">
                <span className="uppercase font-bold text-ink-charcoal flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-marker-orange animate-pulse"></span>
                  Yang Tampaknya Paling Relevan
                </span>
                <span className="bg-sticker-sage border border-ink-charcoal px-2.5 py-0.5 rounded font-bold uppercase text-[10px]">
                  Fokus Utama
                </span>
              </div>

              {/* Main Badge - Removed internal taxonomy leak */}
              <div className="p-5 bg-paper-warm rounded-xl border-[1.5px] border-ink-charcoal mb-5 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-burnt-orange text-2xl">
                    favorite
                  </span>
                  <h2 className="font-headline text-2xl sm:text-3xl font-bold text-ink-charcoal uppercase tracking-tight">
                    {needInsight.primaryNeed.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-ink-charcoal/90 leading-relaxed font-medium">
                  {needInsight.primaryNeed.reason}
                </p>
              </div>

              {/* Narrative Explanation - Label revised per Section 30 */}
              <div className="p-4 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[2px_2px_0px_#171717] mb-5">
                <span className="font-mono-tag text-xs font-bold text-ink-charcoal/70 uppercase block mb-1">
                  Kenapa ini mungkin relevan:
                </span>
                <p className="text-xs sm:text-sm text-ink-charcoal leading-relaxed">
                  {needInsight.explanation}
                </p>
              </div>

              {/* Secondary Needs - Label revised per Section 31 */}
              {needInsight.secondaryNeeds && needInsight.secondaryNeeds.length > 0 && (
                <div>
                  <span className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal/80 block mb-2">
                    Mungkin juga berkaitan:
                  </span>
                  <div className="space-y-2">
                    {needInsight.secondaryNeeds.map((sec, i) => (
                      <div
                        key={i}
                        className="p-3 bg-paper-warm/80 rounded-lg border border-ink-charcoal flex items-center justify-between font-mono-tag text-xs"
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sticker-blue"></span>
                          {sec.title}
                        </span>
                        <span className="text-[11px] text-ink-charcoal/70">
                          {sec.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Quote & User Confirmation - Revised per Section 32 & 33 */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#FFF4DC] border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[4px_4px_0px_#171717] -rotate-1">
                <span className="font-mono-tag text-[10px] text-ink-charcoal/60 uppercase font-bold block mb-1">
                  catatan pinggir ★
                </span>
                <p className="font-script text-2xl text-burnt-orange font-bold leading-snug">
                  “Menyadari apa yang kamu butuhkan bukan berarti kamu lemah. Itu hanya berarti kamu mulai mendengarkan dirimu sendiri.”
                </p>
              </div>

              {/* User Confirmation Card - Revised per Section 33 */}
              <UserConfirmationCard
                currentConfirmation={needConfirmation}
                onConfirm={(conf) => setNeedConfirmation(conf)}
                title="Apakah ini terasa cocok dengan keadaanmu sekarang?"
                subtitle="Kalau belum pas, beri tahu bagian mana yang meleset. Kamu yang paling tahu apa yang kamu butuhkan."
              />
            </div>
          </div>
        )}
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
