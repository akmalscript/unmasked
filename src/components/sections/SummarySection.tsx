"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { AIErrorCard } from "@/components/AIErrorCard";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import { SummaryStage } from "@/types/session";

export function SummarySection() {
  const router = useRouter();
  const isHydrated = useStoreHydrated();
  const isFetchingRef = useRef(false);

  const {
    publicTags,
    actualFeelings,
    loadInsight,
    needInsight,
    selectedAction,
    summaryData,
    setSummaryData,
    resetSession,
  } = useJournalStore();

  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technicalError, setTechnicalError] = useState<string | null>(null);

  const hasAnyData = publicTags.length > 0 || actualFeelings.length > 0 || Boolean(loadInsight) || Boolean(needInsight);

  const currentPublicTags = publicTags.length ? publicTags : ["-"];
  const currentActualFeelings = actualFeelings.length ? actualFeelings : ["-"];
  const currentThemes = loadInsight?.themes?.map((t) => t.name) || ["Refleksi Diri"];
  const currentNeeds = needInsight?.primaryNeed
    ? [needInsight.primaryNeed.title, ...(needInsight.secondaryNeeds?.map((s) => s.title) || [])]
    : ["Kebutuhan Diri"];
  const currentAction =
    selectedAction || "Berikan jeda dan waktu untuk diri sendiri malam ini.";

  const fetchSummary = async (force = false) => {
    if (summaryData && !force) return;
    if (!hasAnyData) return;
    setLoading(true);
    setError(null);
    setTechnicalError(null);

    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatYouShow: currentPublicTags,
          whatYouCarry: currentThemes,
          whatYouMayNeed: currentNeeds,
          selectedActionTitle: "Langkah Kecil",
          selectedActionDesc: currentAction,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSummaryData(json.data as SummaryStage);
      } else {
        setTechnicalError(json.technicalError || null);
        setError(json.error || "Gagal menyusun refleksi penutup.");
      }
    } catch (err) {
      console.error("Failed to generate summary:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (summaryData) return;
    if (!hasAnyData) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, summaryData, hasAnyData]);

  if (isHydrated && !hasAnyData && !summaryData) {
    return (
      <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
        <Header subtitle="RANGKUMAN" showSteps={false} />
        <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-paper-base border-[2px] border-ink-charcoal rounded-2xl p-6 sm:p-8 text-center shadow-[6px_6px_0px_#171717]">
            <div className="w-14 h-14 rounded-full bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-marker-orange text-3xl">auto_stories</span>
            </div>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-ink-charcoal mb-2">
              Belum Ada Rangkuman
            </h2>
            <p className="font-sans text-xs sm:text-sm text-ink-charcoal/80 mb-6 leading-relaxed">
              Kamu belum memulai atau mengisi perjalanan refleksi. Mulai dari awal agar kamu mendapatkan telaah persona, beban pikiran, dan kebutuhan diri yang utuh.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-2.5 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Mulai Perjalanan Refleksi</span>
            </Link>
          </div>
        </main>
        <BottomDock backTo="/" centerLabel="Belum Ada Rangkuman" />
      </div>
    );
  }

  const handleDownload = () => {
    const content = `================================================
UNMASKED — Rangkuman Refleksi Perjalanan
Tanggal: ${new Date().toLocaleDateString("id-ID")}
================================================

1. TAMPILAN LUAR (WHAT YOU SHOW):
${currentPublicTags.join(", ")}

2. RUANG BATIN (WHAT YOU FEEL):
${currentActualFeelings.join(", ")}

3. BEBAN YANG SEDANG DIPIKUL (WHAT YOU CARRY):
- ${currentThemes.join("\n- ")}
Catatan: ${loadInsight?.summary || "-"}

4. KEBUTUHAN DIRIMU (WHAT YOU MAY NEED):
- ${currentNeeds.join("\n- ")}
Penjelasan: ${needInsight?.explanation || "-"}

5. SATU LANGKAH KECILMU (YOUR NEXT STEP):
${currentAction}

6. PESAN PENUTUP:
"${summaryData?.reflection || "Satu langkah kecil tetaplah sebuah langkah. Terima kasih sudah meluangkan waktu untuk mendengarkan dirimu hari ini."}"

================================================
Privat di perangkatmu · Beyond "I'm Fine."
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Unmasked_Refleksi_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-warm tactile-dot-grid pb-40 sm:pb-32">
      <Header subtitle="RANGKUMAN" showSteps={true} stepNumber={4} totalSteps={4} />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12">
        <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl md:rounded-2xl p-5 sm:p-10 md:p-12 shadow-[5px_5px_0px_#171717]">
          <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-full mb-3 font-mono-tag text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-marker-orange animate-pulse"></span>
              <span>Perjalanan Refleksi Utuh</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase">
              “rangkuman perjalananmu.”
            </h1>
            <p className="text-sm sm:text-base text-ink-charcoal/80 mt-2">
              Inilah peta kejujuran batin yang berhasil kamu urai hari ini.
            </p>
            <p className="font-script text-xl sm:text-2xl text-marker-orange font-bold mt-2">
              “look how much you unpacked.”
            </p>
          </div>

          {loading && (
            <div className="max-w-xl mx-auto mb-8">
              <MindfulLoading message="Menyatukan seluruh kepingan refleksimu..." />
            </div>
          )}

          {/* Timeline Steps */}
          <div className="relative max-w-xl mx-auto space-y-6">
            {/* 1. MASK */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal shadow-[1.5px_1.5px_0px_#171717] sm:shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono-tag text-xs sm:text-sm font-bold">
                01
              </div>
              <div className="flex-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-3.5 sm:p-4 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-2 mb-2 font-mono-tag text-xs font-bold uppercase">
                  <span>Step 1: MASK (Topeng vs Rasa)</span>
                  <span className="material-symbols-outlined text-[16px]">theater_comedy</span>
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    Tampilan luar: <strong>{currentPublicTags.join(" · ")}</strong>
                  </div>
                  <div className="text-burnt-orange font-semibold">
                    Ruang batin: <strong>{currentActualFeelings.join(" · ")}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LOAD */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal shadow-[1.5px_1.5px_0px_#171717] sm:shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono-tag text-xs sm:text-sm font-bold">
                02
              </div>
              <div className="flex-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-3.5 sm:p-4 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-2 mb-2 font-mono-tag text-xs font-bold uppercase">
                  <span>Step 2: LOAD (Beban yang Diurai)</span>
                  <span className="material-symbols-outlined text-[16px]">weight</span>
                </div>
                <p className="text-xs text-ink-charcoal/80 mb-2">Tema utama yang sedang dipikul:</p>
                <div className="flex flex-wrap gap-2">
                  {currentThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-sticker-blue/40 border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. NEED */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal shadow-[1.5px_1.5px_0px_#171717] sm:shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono-tag text-xs sm:text-sm font-bold">
                03
              </div>
              <div className="flex-1 bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-3.5 sm:p-4 shadow-[2px_2px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-2 mb-2 font-mono-tag text-xs font-bold uppercase">
                  <span>Step 3: NEED (Kebutuhan Personal)</span>
                  <span className="material-symbols-outlined text-[16px]">favorite</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentNeeds.map((need, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-sticker-sage border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. ACTION */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal shadow-[1.5px_1.5px_0px_#171717] sm:shadow-[2px_2px_0px_#171717] flex items-center justify-center font-mono-tag text-xs sm:text-sm font-bold">
                04
              </div>
              <div className="flex-1 bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-2 mb-2 font-mono-tag text-xs font-bold uppercase">
                  <span>Step 4: ACTION (Langkah Pilihanmu)</span>
                  <span className="material-symbols-outlined text-marker-orange text-[16px]">
                    auto_awesome
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-headline italic font-semibold text-ink-charcoal">
                  “{currentAction}”
                </p>
              </div>
            </div>
          </div>

          {/* AI Loading state */}
          {loading && (
            <div className="max-w-xl mx-auto mt-6">
              <MindfulLoading message="Menyatukan rangkuman refleksi perjalananmu..." />
            </div>
          )}

          {/* AI Error state */}
          {error && !summaryData && (
            <div className="max-w-xl mx-auto mt-6">
              <AIErrorCard
                title="Refleksi Penutup Belum Terhubung"
                message={error}
                technicalError={technicalError}
                onRetry={() => fetchSummary(true)}
                isRetrying={loading}
                continueUrl="/selesai"
                continueLabel="Tetap Selesaikan Perjalanan"
              />
            </div>
          )}

          {/* Reflection synthesis note */}
          {summaryData?.reflection && (
            <div className="max-w-xl mx-auto mt-6 sm:mt-8 p-4 bg-[#FFF8F2] border-[1.5px] border-ink-charcoal rounded-xl text-center shadow-[2px_2px_0px_#171717]">
              <span className="font-mono-tag text-[10px] text-burnt-orange font-bold uppercase block mb-1">
                Catatan Penutup untuk Hatimu:
              </span>
              <p className="font-headline text-xs sm:text-sm text-ink-charcoal font-medium leading-relaxed">
                “{summaryData.reflection}”
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-8 pt-6 border-t-[1.5px] border-ink-charcoal/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-paper-base text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs uppercase shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>{downloaded ? "✓ Tersimpan di Perangkat" : "Unduh File Rangkuman"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetSession();
                router.push("/onboarding");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-paper-warm text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold uppercase shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Mulai Sesi Baru</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/selesai")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 sm:py-3 rounded-full bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold uppercase shadow-[3px_3px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              <span>Selesai Sesi</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      <BottomDock
        backTo="/action-step"
        nextTo="/selesai"
        nextLabel="Selesai"
        centerLabel="Semua Langkah Selesai"
      />
    </div>
  );
}
