"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { useJournalStore } from "@/store/useJournalStore";
import { CandidateNeed, NeedQuestion } from "@/types/session";

export function NeedSheetSection() {
  const {
    loadInsight,
    loadConfirmation,
    maskConfirmation,
    needCandidates,
    needQuestions,
    needAnswers,
    setNeedCandidatesAndQuestions,
    setNeedAnswer,
  } = useJournalStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNeedQuestions = async (force = false) => {
    if (needQuestions.length > 0 && !force) return;
    setLoading(true);
    setError(null);

    try {
      const themes = loadInsight?.themes?.map((t) => t.name) || ["Tuntutan Tugas & Waktu"];
      const summary = loadInsight?.summary || "Merasa kelelahan dengan berbagai tuntutan.";
      const userCorrection = loadConfirmation?.correction || maskConfirmation?.correction;

      const res = await fetch("/api/ai/need/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loadThemes: themes,
          loadSummary: summary,
          userCorrection,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyiapkan pertanyaan kebutuhan.");
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
    }
  };

  useEffect(() => {
    if (needQuestions.length === 0) {
      fetchNeedQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAnswerForQuestion = (qId: string) => {
    return needAnswers.find((a) => a.questionId === qId)?.answer || "";
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="NEED 01/02" showSteps={true} stepNumber={3} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 pt-8 pb-12 flex flex-col items-center">
        <div className="w-full max-w-2xl flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] font-mono-tag text-xs uppercase font-bold">
            Tahap: NEED (Pertanyaan Kontekstual)
          </span>
          <span className="font-mono-tag text-xs text-ink-charcoal/70">Langkah 1 dari 2</span>
        </div>

        <section className="w-full max-w-2xl text-center mb-8">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase mb-2">
            “apa yang sebenarnya kamu butuhkan?”
          </h1>
          <p className="text-sm md:text-base text-ink-charcoal/80 max-w-md mx-auto">
            Bukan survei kaku. Pertanyaan di bawah ini dirancang khusus dari ceritamu agar kita bisa memetakan kebutuhanmu.
          </p>
        </section>

        <section className="w-full max-w-2xl bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[5px_5px_0px_#171717] p-6 sm:p-9 relative mb-8">
          <div className="absolute -top-3.5 left-8 px-4 py-1 bg-sticker-pink border-[1.5px] border-ink-charcoal rounded-sm font-mono-tag text-xs text-ink-charcoal -rotate-2 shadow-[2px_2px_0px_#171717] pointer-events-none">
            eksplorasi kebutuhan personal
          </div>

          {loading && (
            <MindfulLoading message="Menelaah kebutuhan terdalam berdasarkan ceritamu..." />
          )}

          {error && (
            <div className="p-4 bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-xl text-center space-y-2">
              <p className="text-sm font-headline text-ink-charcoal font-bold">
                Gagal memuat pertanyaan kebutuhan: {error}
              </p>
              <button
                type="button"
                onClick={() => fetchNeedQuestions(true)}
                className="px-4 py-1.5 bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold rounded-full border border-ink-charcoal shadow-[2px_2px_0px_#171717]"
              >
                Coba Muat Ulang
              </button>
            </div>
          )}

          {!loading && needQuestions.length > 0 && (
            <div className="space-y-8">
              {/* Candidate teaser chips */}
              {needCandidates.length > 0 && (
                <div className="p-3 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl">
                  <span className="font-mono-tag text-[11px] font-bold uppercase tracking-wider text-burnt-orange block mb-1.5">
                    Area yang mungkin sedang meminta perhatianmu:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {needCandidates.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-paper-base border border-ink-charcoal rounded-full font-mono-tag text-xs font-semibold text-ink-charcoal flex items-center gap-1 shadow-[1px_1px_0px_#171717]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-marker-orange"></span>
                        {c.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Questions List */}
              <div className="space-y-6">
                {needQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 bg-paper-warm/70 border-[1.5px] border-ink-charcoal rounded-xl shadow-[3px_3px_0px_#171717] space-y-3"
                  >
                    <div className="flex items-center justify-between font-mono-tag text-xs">
                      <span className="font-bold text-marker-orange uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">help</span>
                        Pertanyaan Refleksi 0{idx + 1}
                      </span>
                      <span className="text-[10px] bg-paper-base border border-ink-charcoal px-2 py-0.5 rounded font-mono-tag uppercase text-ink-charcoal/70">
                        Arah: {q.targetNeed}
                      </span>
                    </div>

                    <h2 className="font-headline text-base sm:text-lg font-bold text-ink-charcoal leading-snug">
                      “{q.question}”
                    </h2>

                    <div>
                      <textarea
                        rows={3}
                        value={getAnswerForQuestion(q.id)}
                        onChange={(e) => setNeedAnswer(q.id, e.target.value)}
                        placeholder="Tuliskan jawaban atau apa yang terlintas di kepalamu..."
                        className="w-full bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-3 text-xs sm:text-sm font-mono-tag text-ink-charcoal placeholder:text-ink-charcoal/40 focus:outline-none focus:ring-1 focus:ring-marker-orange shadow-[2px_2px_0px_#171717]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center font-mono-tag text-xs text-ink-charcoal/70">
                Setelah selesai menjawab, klik tombol <strong>"Lihat Hasil Kebutuhan"</strong> di bawah untuk melihat sintesis AI.
              </div>
            </div>
          )}
        </section>
      </main>

      <BottomDock
        backTo="/story-reflection"
        nextTo="/need-result"
        nextLabel="Lihat Hasil Kebutuhan"
        centerLabel="NEED: Pertanyaan Refleksi"
      />
    </div>
  );
}
