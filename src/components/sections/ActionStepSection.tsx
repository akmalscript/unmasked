"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import { ActionRecommendation } from "@/types/session";

export function ActionStepSection() {
  const isHydrated = useStoreHydrated();
  const isFetchingRef = useRef(false);

  const {
    publicTags,
    actualFeelings,
    maskConfirmation,
    needInsight,
    needConfirmation,
    loadInsight,
    actionRecommendations,
    setActionRecommendations,
    selectedAction,
    setSelectedAction,
  } = useJournalStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const hasNeedContext = Boolean(needInsight);

  const fetchActionRecommendations = async (force = false) => {
    if (actionRecommendations.length > 0 && !force) return;
    if (!hasNeedContext) return;
    setLoading(true);
    setError(null);

    try {
      const primaryNeed = needInsight?.primaryNeed || {
        key: "control",
        title: "Rasa Kendali",
        reason: needConfirmation?.correction || "Perlu merapikan ritme dan batasan tugas.",
      };

      const themes = loadInsight?.themes?.map((t) => t.name) || ["Refleksi Diri"];
      const summary = loadInsight?.summary || "Kondisi batin yang memerlukan perhatian.";

      const res = await fetch("/api/ai/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maskContext: {
            publicTags,
            actualFeelings,
            userCorrection: maskConfirmation?.correction,
          },
          primaryNeed,
          loadSummary: summary,
          loadThemes: themes,
          needCorrection: needConfirmation?.correction,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyusun langkah aksi.");
      }

      const recs = json.data.recommendations as ActionRecommendation[];
      setActionRecommendations(recs);
      if (recs.length > 0 && !selectedAction) {
        setSelectedAction(recs[0].title + " — " + recs[0].description, recs[0].id);
      }
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
    if (actionRecommendations.length > 0) return;
    if (!hasNeedContext) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    fetchActionRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, actionRecommendations.length, hasNeedContext]);

  if (isHydrated && !hasNeedContext && actionRecommendations.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
        <Header subtitle="ACTION 01/01" showSteps={true} stepNumber={4} totalSteps={4} />
        <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-paper-base border-[2px] border-ink-charcoal rounded-2xl p-6 sm:p-8 text-center shadow-[6px_6px_0px_#171717]">
            <div className="w-14 h-14 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-marker-orange text-3xl">route</span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-ink-charcoal mb-2">
              Kebutuhan Belum Terpetakan
            </h2>
            <p className="font-sans text-xs sm:text-sm text-ink-charcoal/80 mb-6 leading-relaxed">
              Kamu belum menyelesaikan pemetaan kebutuhan di tahap NEED. Mari petakan kebutuhanmu terlebih dahulu agar langkah aksi mikro relevan dan mudah kamu capai.
            </p>
            <Link
              href="/need-result"
              className="inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-2.5 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Buka Pemetaan Kebutuhan</span>
            </Link>
          </div>
        </main>
        <BottomDock backTo="/need-result" centerLabel="Kebutuhan Belum Ada" />
      </div>
    );
  }

  const handleSelectRecommendation = (idx: number) => {
    setSelectedIndex(idx);
    const rec = actionRecommendations[idx];
    if (rec) {
      setSelectedAction(rec.title + " — " + rec.description, rec.id);
      setAgreed(false);
    }
  };

  const currentRec = actionRecommendations[selectedIndex] || null;

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="ACTION" showSteps={true} stepNumber={4} totalSteps={4} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 py-8 md:py-12">
        <div className="mb-3">
          <div className="bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal px-3.5 py-1 rounded-full font-mono-tag text-xs font-bold tracking-wider shadow-[2px_2px_0px_#171717] -rotate-1">
            STAGE: ACTION (Satu Langkah Mikro)
          </div>
        </div>

        <div className="max-w-[700px] text-center mb-8">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
            “satu langkah kecil untukmu.”
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink-charcoal/80">
            Bukan semuanya. Cukup satu hal yang terasa mungkin kamu lakukan hari ini tanpa rasa bersalah.
          </p>
        </div>

        {loading && <MindfulLoading message="Menyusun langkah kecil yang realistis untukmu..." />}

        {error && (
          <div className="p-5 bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-xl text-center space-y-2 mb-8 max-w-md">
            <p className="text-sm font-headline text-ink-charcoal font-bold">
              Gagal memuat rekomendasi: {error}
            </p>
            <button
              type="button"
              onClick={() => fetchActionRecommendations(true)}
              className="px-4 py-1.5 bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold rounded-full border border-ink-charcoal shadow-[2px_2px_0px_#171717]"
            >
              Coba Susun Ulang
            </button>
          </div>
        )}

        {!loading && actionRecommendations.length > 0 && currentRec && (
          <div className="relative w-full max-w-[640px] mb-8">
            <div className="absolute -top-6 -right-2 md:-right-6 z-20 -rotate-3 select-none pointer-events-none">
              <div className="font-script text-marker-orange text-2xl md:text-3xl font-bold">
                “small is enough.”
              </div>
            </div>

            {/* Type selector tabs */}
            <div className="flex items-center gap-2 mb-3">
              {actionRecommendations.map((rec, idx) => {
                const label =
                  rec.type === "primary"
                    ? "Langkah Utama"
                    : rec.type === "low_energy"
                    ? "Energi Rendah (5m)"
                    : "Alternatif";
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={rec.id || idx}
                    type="button"
                    onClick={() => handleSelectRecommendation(idx)}
                    className={`px-3 py-1.5 rounded-full border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold transition-all shadow-[2px_2px_0px_#171717] ${
                      isSelected
                        ? "bg-marker-orange text-ink-charcoal ring-1 ring-ink-charcoal"
                        : "bg-paper-base hover:bg-paper-warm text-ink-charcoal/80"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Main Action Card */}
            <div className="relative bg-paper-warm border-[1.5px] border-ink-charcoal rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_#171717]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-5 border-b-[1.5px] border-ink-charcoal/15 font-mono-tag text-xs">
                <div className="bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-3 shadow-[1.5px_1.5px_0px_#171717]">
                  <span className="text-ink-charcoal/60 uppercase font-semibold block mb-0.5">
                    1. Kebutuhan yang Disasar
                  </span>
                  <span className="font-headline font-bold text-sm text-ink-charcoal uppercase">
                    {needInsight?.primaryNeed?.title || "Rasa Kendali"}
                  </span>
                </div>
                <div className="bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-3 shadow-[1.5px_1.5px_0px_#171717]">
                  <span className="text-ink-charcoal/60 uppercase font-semibold block mb-0.5">
                    2. Estimasi Waktu
                  </span>
                  <span className="font-headline font-bold text-sm text-ink-charcoal">
                    ~{currentRec.estimatedMinutes || 15} Menit Saja
                  </span>
                </div>
              </div>

              {/* Action Title & Description */}
              <div className="py-5">
                <span className="font-mono-tag text-xs uppercase tracking-wider font-bold text-burnt-orange bg-secondary-fixed/50 px-2 py-0.5 rounded border border-burnt-orange/30">
                  3. {currentRec.title}
                </span>
                <div className="mt-2.5 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-4 shadow-[3px_3px_0px_#171717] relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-marker-orange"></div>
                  <blockquote className="pl-2 font-headline text-base sm:text-lg text-ink-charcoal font-semibold leading-snug">
                    “{currentRec.description}”
                  </blockquote>
                </div>
              </div>

              {/* Why This Action */}
              <div className="pt-1">
                <span className="font-mono-tag text-xs uppercase font-bold text-ink-charcoal/70 flex items-center gap-1 mb-1.5">
                  <span className="material-symbols-outlined text-[15px]">lightbulb</span>
                  4. Mengapa Langkah Ini?
                </span>
                <p className="p-3 bg-paper-base/70 border border-ink-charcoal/20 rounded-xl text-xs sm:text-sm text-ink-charcoal/90 leading-relaxed">
                  {currentRec.why}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-5 border-t-[1.5px] border-ink-charcoal/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectRecommendation(
                      (selectedIndex + 1) % actionRecommendations.length
                    )
                  }
                  className="w-full sm:w-auto px-5 py-2 bg-paper-base hover:bg-paper-warm text-ink-charcoal border-[1.5px] border-ink-charcoal rounded-full font-mono-tag text-xs font-bold shadow-[2px_2px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] transition-all"
                >
                  Lihat opsi lainnya ↻
                </button>
                <button
                  type="button"
                  onClick={() => setAgreed(!agreed)}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-mono-tag text-xs font-bold border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                    agreed
                      ? "bg-sticker-sage text-ink-charcoal ring-1 ring-ink-charcoal"
                      : "bg-marker-orange text-ink-charcoal hover:bg-burnt-orange"
                  }`}
                >
                  {agreed ? "✓ Langkah Ini Disepakati" : "Saya akan mencoba ini"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomDock
        backTo="/need-result"
        nextTo="/summary"
        nextLabel="Lihat Rangkuman"
        centerLabel="ACTION: Langkah Terpilih"
      />
    </div>
  );
}
