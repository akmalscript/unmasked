"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { AIErrorCard } from "@/components/AIErrorCard";
import { UserConfirmationCard } from "@/components/UserConfirmationCard";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import { MaskInsight } from "@/types/session";

export function MaskResultSection() {
  const isHydrated = useStoreHydrated();
  const router = useRouter();
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
  const [technicalError, setTechnicalError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const hasInputs = publicTags.length > 0 || actualFeelings.length > 0;
  const currentPublicTags = publicTags.length ? publicTags : ["(Belum memilih)"];
  const currentActualFeelings = actualFeelings.length ? actualFeelings : ["(Belum memilih)"];

  const fetchMaskAnalysis = async (force = false) => {
    if (maskInsight && !force) return;
    setLoading(true);
    setHasScrolledToBottom(false);
    setError(null);
    setTechnicalError(null);

    try {
      const sessionId = useJournalStore.getState().sessionId;
      const res = await fetch("/api/ai/mask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          publicTags: currentPublicTags,
          actualFeelings: currentActualFeelings,
          note: feelingNote,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setTechnicalError(json.code || null);
        throw new Error(json.message || "Gagal menganalisis MASK");
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
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasScrolledToBottom(true);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [loading, maskInsight]);

  useEffect(() => {
    if (!isHydrated) return;

    if (publicTags.length === 0) {
      router.replace("/public-self");
      return;
    }

    if (actualFeelings.length === 0) {
      router.replace("/actual-feeling");
      return;
    }

    if (maskInsight) return;
    if (!hasInputs) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    fetchMaskAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, maskInsight, hasInputs, publicTags, actualFeelings, router]);

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-36 sm:pb-28">
      <Header subtitle="MASK 03/03" showSteps={true} stepNumber={1} totalSteps={4} />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl shadow-[6px_6px_0px_#171717] p-5 sm:p-10 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-7 bg-marker-orange text-ink-charcoal border-[1.2px] border-ink-charcoal rotate-[-1deg] shadow-[1px_1px_0px_#171717] flex items-center justify-center z-20">
            <span className="text-[10px] font-mono-tag uppercase tracking-widest font-bold">
              HASIL TELAAH
            </span>
          </div>

          <div className="text-center mb-8 pt-3">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-charcoal lowercase tracking-tight leading-snug">
              “ada jarak antara yang kamu tampilkan dan yang kamu rasakan.”
            </h1>
          </div>

          {!hasInputs && !maskInsight && (
            <div className="p-6 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl text-center space-y-3 mb-6 shadow-[3px_3px_0px_#171717]">
              <p className="font-headline text-base font-bold text-ink-charcoal">
                Kamu belum memilih tampilan luar atau perasaan batin.
              </p>
              <p className="text-xs text-ink-charcoal/70 max-w-md mx-auto">
                Silakan mulai dari tahap awal agar AI dapat menelaah kontras persona dan perasaanmu dengan tepat.
              </p>
              <Link
                href="/public-self"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold rounded-full border border-ink-charcoal shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <span>Mulai Kenali Dirimu</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* Dual tags card view */}
          <div className="relative py-4 flex flex-col sm:flex-row items-stretch justify-center gap-6">
            {/* Left Card: Tampilan luar */}
            <div className="w-full sm:w-1/2 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[4px_4px_0px_#171717] -rotate-1">
              <div className="flex items-center justify-between mb-3 border-b border-ink-charcoal/20 pb-2">
                <span className="font-mono-tag text-xs text-ink-charcoal/70 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-sticker-blue border border-ink-charcoal"></span>
                  YANG DITAMPILKAN
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
                <span className="font-mono-tag text-xs text-burnt-orange font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-marker-orange border border-ink-charcoal"></span>
                  YANG DIRASAKAN
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
              <AIErrorCard
                title="Koneksi Telaah Persona Terkendala"
                message={error}
                technicalError={technicalError}
                onRetry={() => fetchMaskAnalysis(true)}
                isRetrying={loading}
                continueUrl="/brain-dump"
                continueLabel="Tetap Lanjut ke LOAD (Curahan Pikiran)"
              />
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
                          <div className="flex items-center gap-2 font-mono-tag text-xs font-bold mb-2">
                            <span className="bg-sticker-blue/40 text-ink-charcoal border-[1.5px] border-ink-charcoal px-3 py-1 rounded-full shadow-[1.5px_1.5px_0px_#171717]">
                              {c.publicTrait}
                            </span>
                            <span className="text-ink-charcoal">↔</span>
                            <span className="bg-sticker-pink text-ink-charcoal border-[1.5px] border-ink-charcoal px-3 py-1 rounded-full shadow-[1.5px_1.5px_0px_#171717]">
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

                {/* Refleksi Ruang Batin Card */}
                <div className="bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl p-5 sm:p-7 shadow-[4px_4px_0px_#171717]">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-marker-orange shrink-0"
                    >
                      <path d="M7 2L8.5 6.5L13 8L8.5 9.5L7 14L5.5 9.5L1 8L5.5 6.5L7 2Z" fill="#FF6F1E" />
                      <path d="M17 11L18 14L21 15L18 16L17 19L16 16L13 15L16 14L17 11Z" fill="#FF6F1E" />
                    </svg>
                    <span className="font-script text-marker-orange text-2xl sm:text-3xl font-bold italic tracking-wide">
                      “Refleksi Ruang Batin”
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-ink-charcoal/90 leading-relaxed font-sans">
                    {maskInsight.reflection ||
                      "Terlihat baik-baik saja di luar saat merasa berat di dalam adalah hal yang sangat menguras energi. Tidak apa-apa jika kamu merasa lelah karena harus menjaga topeng tersebut setiap hari. Kamu tidak harus selalu terlihat kuat untuk tetap berharga."}
                  </p>

                  <div className="border-t border-ink-charcoal/15 my-4 sm:my-5" />

                  <div>
                    <p className="font-mono-tag text-xs font-bold uppercase tracking-wider text-marker-orange mb-1.5">
                      PERTANYAAN REFLEKSI UNTUK DIRIMU:
                    </p>
                    <p className="font-sans font-bold italic text-base sm:text-lg text-ink-charcoal leading-snug">
                      {(() => {
                        const raw =
                          maskInsight.question?.trim() ||
                          "Kapan terakhir kali kamu merasa boleh untuk tidak terlihat baik-baik saja?";
                        return raw.startsWith("“") || raw.startsWith('"') ? raw : `“${raw}”`;
                      })()}
                    </p>
                  </div>
                </div>

                {/* User Confirmation Card */}
                <UserConfirmationCard
                  currentConfirmation={maskConfirmation}
                  onConfirm={(conf) => setMaskConfirmation(conf)}
                  badgeLabel="VALIDASI & KENDALI PENGGUNA"
                  title="Apakah telaah kontras ini terasa akurat?"
                  subtitle="Kamu bisa mengonfirmasi, atau meluruskan konteks ini sebelum lanjut ke tahap penguraian beban."
                />
                <div ref={bottomRef} className="h-1 w-full" />
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/actual-feeling"
        nextTo="/brain-dump"
        nextLabel="Lanjut ke LOAD"
        centerLabel=""
        stageBadge="MASK 03/03"
        isNextDisabled={loading || !hasScrolledToBottom}
      />
    </div>
  );
}
