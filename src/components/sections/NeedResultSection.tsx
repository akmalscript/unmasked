"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { UserConfirmationCard } from "@/components/UserConfirmationCard";
import { useJournalStore } from "@/store/useJournalStore";
import { NeedInsight } from "@/types/session";

export function NeedResultSection() {
  const {
    needCandidates,
    needQuestions,
    needAnswers,
    loadInsight,
    needInsight,
    setNeedInsight,
    needConfirmation,
    setNeedConfirmation,
  } = useJournalStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNeedSynthesis = async (force = false) => {
    if (needInsight && !force) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/need/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: needCandidates.length > 0 ? needCandidates : [
            { key: "control", title: "Rasa Kendali", reason: "Banyak tanggung jawab beriringan", relevance: "high" },
            { key: "rest", title: "Istirahat", reason: "Energi terasa terkuras", relevance: "medium" }
          ],
          questions: needQuestions.length > 0 ? needQuestions : [
            { id: "q1", question: "Apa yang paling membebani?", targetNeed: "control" }
          ],
          answers: needAnswers,
          loadSummary: loadInsight?.summary || "Beban akademik dan ekspektasi yang tinggi.",
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
    }
  };

  useEffect(() => {
    if (!needInsight) {
      fetchNeedSynthesis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="NEED 02/02" showSteps={true} stepNumber={3} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-8 md:py-12">
        <div className="max-w-3xl mb-8">
          <p className="font-mono-tag text-xs font-bold text-burnt-orange uppercase tracking-wider mb-1">
            PENILAIAN KEBUTUHAN DIRIMU
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
            “area kebutuhanmu saat ini”
          </h1>
          <p className="text-sm md:text-base text-ink-charcoal/80 mt-2">
            Berdasarkan apa yang kamu ceritakan dan jawab, inilah ruang kebutuhan yang paling meminta dipenuhi.
          </p>
        </div>

        {loading && <MindfulLoading message="Sedang menyelaraskan kebutuhan intimu..." />}

        {error && (
          <div className="p-5 bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-xl text-center space-y-2 mb-8">
            <p className="text-sm font-headline text-ink-charcoal font-bold">
              Gagal memuat hasil kebutuhan: {error}
            </p>
            <button
              type="button"
              onClick={() => fetchNeedSynthesis(true)}
              className="px-4 py-1.5 bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold rounded-full border border-ink-charcoal shadow-[2px_2px_0px_#171717]"
            >
              Coba Sintesis Ulang
            </button>
          </div>
        )}

        {!loading && needInsight && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Primary Need Card */}
            <div className="lg:col-span-7 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-6 md:p-8 shadow-[5px_5px_0px_#171717]">
              <div className="flex items-center justify-between pb-3 mb-5 border-b-[1.5px] border-ink-charcoal font-mono-tag text-xs">
                <span className="uppercase font-bold text-ink-charcoal flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-marker-orange animate-pulse"></span>
                  Kebutuhan Prioritas Terdeteksi
                </span>
                <span className="bg-sticker-sage border border-ink-charcoal px-2.5 py-0.5 rounded font-bold uppercase text-[10px]">
                  Fokus Utama
                </span>
              </div>

              {/* Main Badge */}
              <div className="p-5 bg-paper-warm rounded-xl border-[1.5px] border-ink-charcoal mb-5 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-burnt-orange text-2xl">
                    favorite
                  </span>
                  <h2 className="font-headline text-2xl sm:text-3xl font-bold text-ink-charcoal uppercase tracking-tight">
                    {needInsight.primaryNeed.title}
                  </h2>
                </div>
                <p className="font-mono-tag text-xs text-burnt-orange font-bold uppercase mb-2">
                  Kategori Taksonomi: {needInsight.primaryNeed.key}
                </p>
                <p className="text-xs sm:text-sm text-ink-charcoal/90 leading-relaxed font-medium">
                  {needInsight.primaryNeed.reason}
                </p>
              </div>

              {/* Narrative Explanation */}
              <div className="p-4 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[2px_2px_0px_#171717] mb-5">
                <span className="font-mono-tag text-xs font-bold text-ink-charcoal/70 uppercase block mb-1">
                  Penjelasan Reflektif:
                </span>
                <p className="text-xs sm:text-sm text-ink-charcoal leading-relaxed">
                  {needInsight.explanation}
                </p>
              </div>

              {/* Secondary Needs if any */}
              {needInsight.secondaryNeeds && needInsight.secondaryNeeds.length > 0 && (
                <div>
                  <span className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal/80 block mb-2">
                    Kebutuhan Pendukung Lainnya:
                  </span>
                  <div className="space-y-2">
                    {needInsight.secondaryNeeds.map((sec, i) => (
                      <div
                        key={i}
                        className="p-3 bg-paper-warm/80 rounded-lg border border-ink-charcoal flex items-center justify-between font-mono-tag text-xs"
                      >
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sticker-blue"></span>
                          {sec.title} ({sec.key})
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

            {/* Right Side: Quote & User Confirmation */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#FFF4DC] border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[4px_4px_0px_#171717] -rotate-1">
                <span className="font-mono-tag text-[10px] text-ink-charcoal/60 uppercase font-bold block mb-1">
                  catatan pinggir ★
                </span>
                <p className="font-script text-2xl text-burnt-orange font-bold leading-snug">
                  “you don&apos;t have to fix everything today.”
                </p>
                <p className="text-xs text-ink-charcoal/80 mt-2">
                  Mengakui kebutuhan ini bukan tanda kelemahan, melainkan tanda bahwa kamu peduli pada keberlangsungan dirimu.
                </p>
              </div>

              {/* User Confirmation Card */}
              <UserConfirmationCard
                currentConfirmation={needConfirmation}
                onConfirm={(conf) => setNeedConfirmation(conf)}
                title="Apakah kebutuhan ini terasa paling relevan bagimu saat ini?"
                subtitle="Jika kamu merasa ada kebutuhan lain yang lebih mendesak, tuliskan di sini agar langkah tindakan (ACTION) disesuaikan."
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
