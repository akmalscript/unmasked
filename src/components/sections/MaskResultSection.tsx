"use client";

import React, { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { UserConfirmationCard } from "@/components/UserConfirmationCard";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import { MaskInsight } from "@/types/session";

export function MaskResultSection() {
  const isHydrated = useStoreHydrated();
  const isFetchingRef = useRef(false);

  const {
    publicTags,
    actualFeelings,
    feelingNote,
    maskInsight,
    setMaskInsight,
    maskConfirmation,
    setMaskConfirmation,
  } = useJournalStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPublicTags = publicTags.length ? publicTags : ["Produktif", "Kuat"];
  const currentActualFeelings = actualFeelings.length ? actualFeelings : ["Lelah", "Kewalahan"];

  const fetchMaskAnalysis = async (force = false) => {
    if (maskInsight && !force) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/mask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicTags: currentPublicTags,
          actualFeelings: currentActualFeelings,
          note: feelingNote,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menganalisis MASK");
      }

      setMaskInsight(json.data as MaskInsight);
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
    if (maskInsight) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    fetchMaskAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, maskInsight]);

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="MASK 03/04" showSteps={true} stepNumber={1} totalSteps={4} />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-6 md:px-12 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl shadow-[6px_6px_0px_#171717] p-6 sm:p-10 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-7 bg-marker-orange text-ink-charcoal border-[1.2px] border-ink-charcoal rotate-[-1deg] shadow-[1px_1px_0px_#171717] flex items-center justify-center z-20">
            <span className="text-[10px] font-mono-tag uppercase tracking-widest font-bold">
              HASIL TELAAH MASK
            </span>
          </div>

          <div className="text-center mb-8 pt-3">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-charcoal lowercase tracking-tight leading-snug">
              “ada jarak antara yang kamu tampilkan dan rasakan.”
            </h1>
            <p className="text-xs sm:text-sm text-ink-charcoal/70 mt-2 max-w-md mx-auto">
              Memahami dua lapisan diri yang kamu bawa dalam interaksi sehari-hari.
            </p>
          </div>

          {/* Dual tags card view */}
          <div className="relative py-4 flex flex-col sm:flex-row items-stretch justify-center gap-6">
            {/* Left Card: Tampilan luar */}
            <div className="w-full sm:w-1/2 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[4px_4px_0px_#171717] -rotate-1">
              <div className="flex items-center justify-between mb-3 border-b border-ink-charcoal/20 pb-2">
                <span className="font-mono-tag text-xs text-ink-charcoal/70 lowercase flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-sticker-blue border border-ink-charcoal"></span>
                  tampilan luar (public self)
                </span>
                <span className="material-symbols-outlined text-ink-charcoal/40 text-[16px]">
                  visibility
                </span>
              </div>
              <p className="font-headline text-sm font-semibold text-ink-charcoal mb-3">
                Orang melihat kamu sebagai:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentPublicTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-sticker-blue/40 text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs px-3 py-1 rounded-full shadow-[1.5px_1.5px_0px_#171717] font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Card: Perasaan batin */}
            <div className="w-full sm:w-1/2 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[5px_5px_0px_#171717] rotate-1">
              <div className="flex items-center justify-between mb-3 border-b border-ink-charcoal/20 pb-2">
                <span className="font-mono-tag text-xs text-burnt-orange font-bold lowercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-marker-orange border border-ink-charcoal"></span>
                  ruang batin (actual feeling)
                </span>
                <span className="material-symbols-outlined text-marker-orange text-[16px]">
                  favorite
                </span>
              </div>
              <p className="font-headline text-sm font-semibold text-ink-charcoal mb-3">
                Namun kamu merasa:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentActualFeelings.map((f) => (
                  <span
                    key={f}
                    className="bg-sticker-pink text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs px-3 py-1 rounded-full shadow-[1.5px_1.5px_0px_#171717] font-semibold"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Content Section */}
          <div className="mt-8 pt-6 border-t-[1.5px] border-ink-charcoal/20">
            {loading && <MindfulLoading message="Sedang menelaah kontras topeng dirimu..." />}

            {error && (
              <div className="p-4 bg-sticker-pink/30 border-[1.5px] border-ink-charcoal rounded-xl text-center space-y-2">
                <p className="text-sm font-headline text-ink-charcoal font-bold">
                  Belum berhasil menghubungkan telaah AI: {error}
                </p>
                <button
                  type="button"
                  onClick={() => fetchMaskAnalysis(true)}
                  className="px-4 py-1.5 bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold rounded-full border border-ink-charcoal shadow-[2px_2px_0px_#171717]"
                >
                  Coba Analisis Ulang
                </button>
              </div>
            )}

            {!loading && maskInsight && (
              <div className="space-y-6">
                {/* Contrast items */}
                {maskInsight.contrasts && maskInsight.contrasts.length > 0 && (
                  <div>
                    <span className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal block mb-3">
                      Kontras yang Terdeteksi:
                    </span>
                    <div className="space-y-3">
                      {maskInsight.contrasts.map((c, i) => (
                        <div
                          key={i}
                          className="p-3.5 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl shadow-[2px_2px_0px_#171717]"
                        >
                          <div className="flex items-center gap-2 font-mono-tag text-xs font-bold mb-1">
                            <span className="text-sticker-blue bg-paper-base border border-ink-charcoal px-2 py-0.5 rounded">
                              {c.publicTrait}
                            </span>
                            <span className="text-ink-charcoal">↔</span>
                            <span className="text-burnt-orange bg-paper-base border border-ink-charcoal px-2 py-0.5 rounded">
                              {c.internalState}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-ink-charcoal/80 leading-relaxed">
                            {c.interpretation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overall Reflection */}
                <div className="bg-[#FFF8F2] border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[3px_3px_0px_#171717]">
                  <div className="flex items-center gap-2 text-burnt-orange font-script text-xl font-bold mb-2">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    <span>“Refleksi Ruang Batin”</span>
                  </div>
                  <p className="text-sm sm:text-base text-ink-charcoal leading-relaxed font-medium">
                    {maskInsight.reflection}
                  </p>

                  {maskInsight.question && (
                    <div className="mt-4 pt-3 border-t border-ink-charcoal/20">
                      <p className="font-mono-tag text-xs uppercase font-bold text-marker-orange mb-1">
                        Pertanyaan Refleksi untuk Dirimu:
                      </p>
                      <p className="font-headline italic font-bold text-sm sm:text-base text-ink-charcoal">
                        “{maskInsight.question}”
                      </p>
                    </div>
                  )}
                </div>

                {/* User Confirmation Card */}
                <UserConfirmationCard
                  currentConfirmation={maskConfirmation}
                  onConfirm={(conf) => setMaskConfirmation(conf)}
                  title="Apakah telaah kontras ini terasa akurat?"
                  subtitle="Kamu bisa mengonfirmasi, atau meluruskan konteks ini sebelum lanjut ke tahap penguraian beban."
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/actual-feeling"
        nextTo="/brain-dump"
        nextLabel="Lanjut ke LOAD"
        centerLabel="MASK Selesai"
      />
    </div>
  );
}
