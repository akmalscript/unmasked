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
  const [technicalError, setTechnicalError] = useState<string | null>(null);

  const hasBrainDump = brainDump.trim().length > 0 || stickyNotes.length > 0;
  const currentBrainDump =
    brainDump.trim() ||
    stickyNotes.map((n) => n.text).filter(Boolean).join(". ");

  const fetchLoadAnalysis = async (force = false) => {
    if (loadInsight && !force) return;
    if (!hasBrainDump) return;
    setLoading(true);
    setError(null);
    setTechnicalError(null);

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
        setTechnicalError(json.technicalError || null);
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
        <BottomDock backTo="/brain-dump" centerLabel="Curahan Masih Kosong" stageBadge="LOAD 02/02" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-36 sm:pb-28">
      <Header subtitle="LOAD 02/02" showSteps={true} stepNumber={2} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-10 flex flex-col items-center">
        {/* Stage Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-[1.5px] border-ink-charcoal bg-paper-base shadow-[1.5px_1.5px_0px_#171717] mb-3">
          <span className="w-2 h-2 rounded-full bg-marker-orange border border-ink-charcoal" />
          <span className="font-mono-tag text-[11px] sm:text-xs font-bold uppercase tracking-wider text-ink-charcoal">
            TAHAP: LOAD / TELAAH BEBAN BATIN
          </span>
        </div>

        <div className="w-full max-w-[780px] text-center mb-6">
          <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink-charcoal lowercase mb-2">
            “ini yang kami tangkap dari ceritamu.”
          </h1>
          <p className="text-xs sm:text-sm text-ink-charcoal/80 max-w-[560px] mx-auto leading-relaxed">
            Kami mencoba merapikan apa yang kamu tulis menjadi beberapa hal yang mungkin sedang kamu bawa saat ini.
          </p>
        </div>

        <div className="w-full max-w-[780px] bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl shadow-[6px_6px_0px_#171717] relative overflow-hidden">
          {/* Window Header */}
          <div className="bg-paper-warm border-b-[1.5px] border-ink-charcoal px-4 sm:px-6 py-2.5 flex items-center justify-between font-mono-tag text-xs text-ink-charcoal">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-sticker-pink" />
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-marker-orange" />
              <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-sticker-sage" />
              <span className="ml-1 font-semibold text-ink-charcoal/80">telaah_beban_refleksi.md</span>
            </div>
            <span className="font-script text-marker-orange text-sm sm:text-base font-bold italic">
              Refleksi Cermin
            </span>
          </div>

          <div className="p-5 sm:p-7 md:p-8 flex flex-col gap-5 sm:gap-6">
            {loading && <MindfulLoading message="Sedang mengurai benang kusut curahan pikiranmu..." />}

            {error && (
              <AIErrorCard
                title="Koneksi Telaah Beban Terkendala"
                message={error}
                technicalError={technicalError}
                onRetry={() => fetchLoadAnalysis(true)}
                isRetrying={loading}
                continueUrl="/need-sheet"
                continueLabel="Tetap Lanjut ke NEED (Pemetaan Kebutuhan)"
              />
            )}

            {!loading && loadInsight && (
              <>
                {/* 1. BEBAN INTI (SUMMARY) */}
                <div>
                  <div className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal flex items-center gap-2 mb-2.5">
                    <span className="w-2.5 h-2.5 bg-marker-orange border border-ink-charcoal inline-block" />
                    <span>1. INTI BEBAN YANG SEDANG DIPIKUL</span>
                  </div>
                  <div className="bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-4 sm:p-5 shadow-[2px_2px_0px_#171717]">
                    <blockquote className="text-xs sm:text-sm text-ink-charcoal italic font-medium leading-relaxed pl-3 border-l-[3px] border-marker-orange">
                      “{loadInsight.summary || "Minggu ini terasa sangat berat karena banyaknya tugas yang menumpuk. Kamu merasa harus tetap terlihat produktif dan baik-baik saja di depan teman kelompok, padahal sebenarnya energi kamu sudah habis."}”
                    </blockquote>
                  </div>
                </div>

                {/* 2. TEMA-TEMA UTAMA */}
                <div>
                  <div className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal flex items-center gap-2 mb-2.5">
                    <span className="w-2.5 h-2.5 bg-sticker-blue border border-ink-charcoal inline-block" />
                    <span>2. TEMA YANG MUNCUL</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {(loadInsight.themes && loadInsight.themes.length > 0
                      ? loadInsight.themes
                      : [
                          {
                            name: "Tumpukan Tugas Kuliah",
                            description:
                              "Banyaknya tenggat waktu yang harus diselesaikan dalam waktu bersamaan minggu ini.",
                          },
                          {
                            name: "Menjaga Penampilan",
                            description:
                              "Tekanan untuk terus terlihat baik-baik saja di depan teman kelompok meskipun sedang lelah.",
                          },
                        ]
                    ).map((theme, i) => (
                      <div
                        key={i}
                        className="bg-sticker-blue/20 border-[1.5px] border-ink-charcoal rounded-xl p-3.5 sm:p-4 shadow-[2px_2px_0px_#171717] flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5 font-mono-tag text-xs font-bold text-ink-charcoal">
                          <span className="material-symbols-outlined text-[16px] text-ink-charcoal">
                            label
                          </span>
                          <span>{theme.name}</span>
                        </div>
                        {theme.description && (
                          <p className="text-[11px] sm:text-xs text-ink-charcoal/80 leading-relaxed font-sans">
                            {theme.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. KONTEKS EMOSIONAL & POLA YANG TERBENTUK */}
                <div className="space-y-3">
                  <div className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal flex items-center gap-2 mb-2.5">
                    <span className="w-2.5 h-2.5 bg-sticker-sage border border-ink-charcoal inline-block" />
                    <span>3. KONTEKS EMOSIONAL & POLA YANG TERBENTUK</span>
                  </div>

                  {/* Emotional chips */}
                  {loadInsight.emotionalContext && loadInsight.emotionalContext.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {loadInsight.emotionalContext.map((em, i) => (
                        <span
                          key={i}
                          className="px-3.5 py-1 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold text-ink-charcoal shadow-[1.5px_1.5px_0px_#171717]"
                        >
                          {em.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pola Batin Card */}
                  <div className="bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-4 sm:p-5 shadow-[2px_2px_0px_#171717]">
                    <p className="font-mono-tag text-xs font-bold uppercase tracking-wider text-marker-orange mb-1.5">
                      POLA BATIN:
                    </p>
                    <p className="text-xs sm:text-sm text-ink-charcoal leading-relaxed font-sans">
                      {loadInsight.patterns?.[0]?.description ||
                        "Kamu merasa harus selalu tampil kuat di depan orang lain saat sedang kewalahan dengan tugas, sehingga tidak ada ruang untuk beristirahat."}
                    </p>
                  </div>
                </div>

                {/* 5. PERTANYAAN UNTUK MEMPERJELAS */}
                <div className="bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-4 sm:p-5 shadow-[2px_2px_0px_#171717]">
                  <p className="font-mono-tag text-xs font-bold uppercase tracking-wider text-marker-orange mb-1.5">
                    PERTANYAAN UNTUK MEMPERJELAS:
                  </p>
                  <p className="font-sans italic font-bold text-xs sm:text-sm text-ink-charcoal leading-relaxed">
                    {(() => {
                      const q =
                        loadInsight.question?.trim() ||
                        "Dari tumpukan tugas itu, bagian mana yang paling bikin kamu merasa paling sesak?";
                      return q.startsWith("“") || q.startsWith('"') ? q : `“${q}”`;
                    })()}
                  </p>
                </div>

                {/* USER CONFIRMATION CARD */}
                <UserConfirmationCard
                  currentConfirmation={loadConfirmation}
                  onConfirm={(conf) => setLoadConfirmation(conf)}
                  badgeLabel="VALIDASI & KENDALI PENGGUNA"
                  title="Apakah rangkuman tema & beban ini sesuai dengan ceritamu?"
                  subtitle="Jika ada bagian yang kurang tepat atau ingin kamu luruskan, kamu memegang kendali penuh."
                />
              </>
            )}

            {/* Footer Inside Window Card */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <Link
                href="/brain-dump"
                className="inline-flex items-center gap-2 px-4 py-2 bg-paper-base hover:bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl shadow-[2px_2px_0px_#171717] font-mono-tag text-xs font-bold text-ink-charcoal active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Edit Tulisan Brain Dump</span>
              </Link>

              <div className="flex items-center gap-1.5">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-marker-orange -rotate-12"
                >
                  <path
                    d="M4 20L8 19L19 8L16 5L5 16L4 20Z"
                    fill="#FF6F1E"
                    stroke="#171717"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="M4 20L6 17.5L6.5 19.5L4 20Z" fill="#171717" />
                  <path
                    d="M9.5 7.5L12.5 10.5M13 4L16 7M6.5 11L9.5 14"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-script text-lg sm:text-xl font-bold text-marker-orange italic">
                  “you know yourself best.”
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/brain-dump"
        nextTo="/need-sheet"
        nextLabel="Lanjut ke NEED"
        stageBadge="LOAD 02/02"
        isNextDisabled={loading || !loadInsight}
      />
    </div>
  );
}
