"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { AIErrorCard } from "@/components/AIErrorCard";
import {
  useJournalStore,
  useStoreHydrated,
  getConfirmedLoadSummary,
  getConfirmedLoadThemes,
} from "@/store/useJournalStore";
import { useSafetyUIStore } from "@/store/useSafetyUIStore";
import { CandidateNeed, NeedQuestion } from "@/types/session";

export function NeedSheetSection() {
  const isHydrated = useStoreHydrated();
  const isFetchingRef = useRef(false);

  const {
    publicTags,
    actualFeelings,
    maskInsight,
    maskConfirmation,
    brainDump,
    loadInsight,
    loadConfirmation,
    needCandidates,
    needQuestions,
    needAnswers,
    setNeedCandidatesAndQuestions,
    setNeedAnswer,
  } = useJournalStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicalError, setTechnicalError] = useState<string | null>(null);

  const hasLoadContext = Boolean(loadInsight && loadInsight.themes && loadInsight.themes.length > 0);

  const fetchNeedQuestions = async (force = false) => {
    if (needQuestions.length > 0 && !force) return;
    if (!hasLoadContext || !loadInsight) return;
    setLoading(true);
    setError(null);
    setTechnicalError(null);

    try {
      const themes = getConfirmedLoadThemes({ loadInsight, loadConfirmation });
      const summary = getConfirmedLoadSummary({ loadInsight, loadConfirmation, brainDump });
      const sessionId = useJournalStore.getState().sessionId;

      const res = await fetch("/api/ai/need/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          maskContext: {
            publicTags,
            actualFeelings,
            reflection: maskInsight?.reflection,
            userCorrection: maskConfirmation?.correction,
          },
          loadContext: {
            themes,
            summary,
            userCorrection: loadConfirmation?.correction,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.code === "SAFETY_INTERVENTION") {
          if (json.intervention) {
            useSafetyUIStore.getState().openIntervention(json.intervention);
            useJournalStore.getState().setSafetyState({
              status: "intervention",
              riskLevel: json.intervention.riskLevel || "high",
              category: json.intervention.category,
              source: "ai",
              triggeredAt: new Date().toISOString(),
              handled: false,
            });
          } else {
            useSafetyUIStore.getState().openManualSupport();
          }
        }
        setTechnicalError(json.code || null);
        throw new Error(json.message || "Gagal menyiapkan pertanyaan.");
      }

      const { candidates, questions } = json.data as {
        candidates: CandidateNeed[];
        questions: NeedQuestion[];
      };

      setNeedCandidatesAndQuestions(candidates, questions);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat pertanyaan.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (needQuestions.length > 0) return;
    if (!hasLoadContext) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    fetchNeedQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, needQuestions.length, hasLoadContext]);

  if (isHydrated && !hasLoadContext && needQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
        <Header subtitle="NEED 01/02" showSteps={true} stepNumber={3} totalSteps={4} />
        <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-paper-base border-[2px] border-ink-charcoal rounded-2xl p-6 sm:p-8 text-center shadow-[6px_6px_0px_#171717]">
            <div className="w-14 h-14 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-marker-orange text-3xl">psychology_alt</span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-ink-charcoal mb-2">
              Beban Belum Diuraikan
            </h2>
            <p className="font-sans text-xs sm:text-sm text-ink-charcoal/80 mb-6 leading-relaxed">
              Kamu belum menguraikan beban pikiran di tahap LOAD. Agar pertanyaan refleksi ini tepat sasaran, mari isi telaah beban terlebih dahulu.
            </p>
            <Link
              href="/brain-dump"
              className="inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-2.5 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Buka Tahap Brain Dump</span>
            </Link>
          </div>
        </main>
        <BottomDock backTo="/brain-dump" centerLabel="Tahap Belum Selesai" stageBadge="NEED 01/02" />
      </div>
    );
  }

  const getAnswerForQuestion = (qId: string) => {
    return needAnswers.find((a) => a.questionId === qId)?.answer || "";
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-36 sm:pb-28">
      <Header subtitle="NEED 01/02" showSteps={true} stepNumber={3} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 pt-6 pb-12 flex flex-col items-center">
        {/* Heading Section - Revised per Section 10 & 11 */}
        <section className="w-full max-w-2xl text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="bg-marker-orange text-ink-charcoal font-mono-tag text-xs uppercase px-3 py-1 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] -rotate-2 font-bold">
              TAHAP 03 - NEED
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase mb-2">
            Apa yang paling kamu butuhkan sekarang?
          </h1>
        </section>

        {/* Main Card */}
        <section className="w-full max-w-2xl bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[5px_5px_0px_#171717] p-5 sm:p-9 relative mb-8">
          {/* Tape Label - Revised per Section 12 */}
          <div className="absolute -top-3.5 left-4 sm:left-8 px-3 sm:px-4 py-1 bg-sticker-pink border-[1.5px] border-ink-charcoal rounded-sm font-mono-tag text-[10px] sm:text-xs text-ink-charcoal -rotate-2 shadow-[2px_2px_0px_#171717] pointer-events-none font-semibold">
            mencari tahu yang paling kamu butuhkan
          </div>

          {/* Loading State - Revised per Section 13 */}
          {loading && (
            <MindfulLoading message="Sedang menyusun beberapa pertanyaan dari ceritamu..." />
          )}

          {error && (
            <AIErrorCard
              title="Koneksi Penyiapan Pertanyaan Terkendala"
              message={error}
              technicalError={technicalError}
              onRetry={() => fetchNeedQuestions(true)}
              isRetrying={loading}
              continueUrl="/need-result"
              continueLabel="Tetap Lanjut ke Hasil Kebutuhan"
            />
          )}

          {!loading && needQuestions.length > 0 && (
            <div className="space-y-7">
              {/* Candidate Teaser - Revised per Section 14 */}
              {needCandidates.length > 0 && (
                <div className="p-3.5 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl shadow-[1.5px_1.5px_0px_#171717]">
                  <span className="font-mono-tag text-xs font-bold text-ink-charcoal block mb-2">
                    Dari ceritamu, beberapa hal ini mungkin sedang kamu butuhkan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {needCandidates.map((c, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-paper-base border border-ink-charcoal rounded-full font-mono-tag text-xs font-semibold text-ink-charcoal flex items-center gap-1.5 shadow-[1px_1px_0px_#171717]"
                      >
                        <span className="w-2 h-2 rounded-full bg-marker-orange"></span>
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Questions List - Revised per Section 15 & 16 */}
              <div className="space-y-6">
                {needQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 bg-paper-warm/70 border-[1.5px] border-ink-charcoal rounded-xl shadow-[3px_3px_0px_#171717] space-y-3"
                  >
                    <div className="flex items-center gap-1.5 font-mono-tag text-xs font-bold text-marker-orange uppercase">
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      <span>Pertanyaan untukmu 0{idx + 1}</span>
                    </div>

                    <h2 className="font-headline text-base sm:text-lg font-bold text-ink-charcoal leading-snug">
                      “{q.question}”
                    </h2>

                    <div>
                      {/* Textarea Placeholder - Revised per Section 17 */}
                      <textarea
                        rows={3}
                        value={getAnswerForQuestion(q.id)}
                        onChange={(e) => setNeedAnswer(q.id, e.target.value)}
                        placeholder="Jawab dengan kata, kalimat, atau cerita singkat..."
                        className="w-full bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-3 text-xs sm:text-sm font-mono-tag text-ink-charcoal placeholder:text-ink-charcoal/40 focus:outline-none focus:ring-1 focus:ring-marker-orange shadow-[2px_2px_0px_#171717]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Dock - Revised per Section 19 */}
      <BottomDock
        backTo="/story-reflection"
        nextTo="/need-result"
        nextLabel="Lanjut ke Hasil Refleksi"
        stageBadge="NEED 01/02"
        isNextDisabled={loading || needQuestions.length === 0 || needQuestions.some(q => getAnswerForQuestion(q.id).trim() === "")}
      />
    </div>
  );
}
