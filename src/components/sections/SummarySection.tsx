"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { MindfulLoading } from "@/components/MindfulLoading";
import { AIErrorCard } from "@/components/AIErrorCard";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import { SummaryStage } from "@/types/session";

export function SummarySection() {
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
              className="inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-2.5 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Mulai Perjalanan Refleksi</span>
            </Link>
          </div>
        </main>
        <BottomDock backTo="/" centerLabel="Belum Ada Rangkuman" stageBadge="RANGKUMAN" />
      </div>
    );
  }

  const handleDownload = async () => {
    const element = document.getElementById("receipt-export-content");
    if (!element) return;

    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      // Next.js dev server mengintersep console.error dan membuat layar merah.
      // html-to-image secara internal memunculkan console.error saat mencoba membaca 
      // stylesheet dari Google Fonts (CORS). Kita matikan sementara console.error untuk itu.
      const originalError = console.error;
      console.error = (...args) => {
        if (args.join(" ").includes("cssRules")) return;
        originalError(...args);
      };

      const imgData = await toPng(element, {
        pixelRatio: 3,
        backgroundColor: "#FFF8F2",
      });

      console.error = originalError;

      const rect = element.getBoundingClientRect();
      const pdfWidth = 80; // Lebar standar struk (mm)
      const pdfHeight = (rect.height * pdfWidth) / rect.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Unmasked_Refleksi_${new Date().toISOString().slice(0, 10)}.pdf`);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-40 sm:pb-32">
      <Header subtitle="RANGKUMAN" />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 pt-6 pb-12 flex flex-col items-center">
        {/* Heading Section */}
        <section className="w-full max-w-2xl text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="bg-marker-orange text-ink-charcoal font-mono-tag text-xs uppercase px-3 py-1 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] -rotate-2 font-bold">
              SUMMARY
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase mb-2">
            rangkuman perjalananmu
          </h1>
          <p className="text-sm md:text-base text-ink-charcoal/80 mt-2">
            Inilah peta kejujuran batin yang berhasil kamu urai hari ini.
          </p>
          <p className="font-script text-xl sm:text-2xl text-marker-orange font-bold mt-2">
            “look how much you unpacked.”
          </p>
        </section>

        {/* Main Card */}
        <section className="w-full max-w-2xl bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[5px_5px_0px_#171717] p-5 sm:p-9 relative mb-8">
          <div className="absolute -top-3.5 left-4 sm:left-8 px-3 sm:px-4 py-1 bg-sticker-sage border-[1.5px] border-ink-charcoal rounded-sm font-mono-tag text-[10px] sm:text-xs text-ink-charcoal -rotate-2 shadow-[2px_2px_0px_#171717] pointer-events-none font-semibold">
            refleksi utuh perjalananmu
          </div>

          {loading ? (
            <div className="max-w-xl mx-auto py-12">
              <MindfulLoading message="Menyatukan seluruh kepingan refleksimu..." />
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 w-full">
              {/* Timeline Steps */}
              <div className="relative w-full space-y-6">
                {/* 1. MASK */}
                <div className="relative bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-4 sm:p-5 shadow-[3px_3px_0px_#171717]">
                  <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-3 mb-3 font-mono-tag text-xs font-bold uppercase">
                    <div className="flex items-center gap-2">
                      <span className="bg-ink-charcoal text-paper-warm px-2 py-0.5 rounded-sm">01</span>
                      <span>TAMPILAN LUAR & RUANG BATIN (WHAT YOU SHOW & FEEL)</span>
                    </div>
                  </div>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-ink-charcoal/70 mr-1">Yang Ditampilkan:</span>
                      <strong>{currentPublicTags.join(" · ")}</strong>
                    </div>
                    <div>
                      <span className="text-ink-charcoal/70 mr-1">Yang Dirasakan:</span>
                      <strong>{currentActualFeelings.join(" · ")}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. LOAD */}
                <div className="relative bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-4 sm:p-5 shadow-[3px_3px_0px_#171717]">
                  <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-3 mb-3 font-mono-tag text-xs font-bold uppercase">
                    <div className="flex items-center gap-2">
                      <span className="bg-ink-charcoal text-paper-warm px-2 py-0.5 rounded-sm">02</span>
                      <span>BEBAN PIKIRAN (WHAT YOU CARRY)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-ink-charcoal/80 mb-3 font-mono-tag uppercase font-bold tracking-wide">Tema utama yang sedang dipikul:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentThemes.map((theme, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-full bg-white border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold shadow-[2px_2px_0px_#171717]"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    {loadInsight?.summary && (
                      <div className="pt-2 border-t border-ink-charcoal/10">
                        <span className="block text-ink-charcoal/80 mb-1 font-mono-tag uppercase text-[10px] font-bold tracking-wide">Catatan:</span>
                        <p className="text-ink-charcoal text-xs italic leading-relaxed">{loadInsight.summary}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. NEED */}
                <div className="relative bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl p-4 sm:p-5 shadow-[3px_3px_0px_#171717]">
                  <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-3 mb-3 font-mono-tag text-xs font-bold uppercase">
                    <div className="flex items-center gap-2">
                      <span className="bg-ink-charcoal text-paper-warm px-2 py-0.5 rounded-sm">03</span>
                      <span>KEBUTUHAN DIRI (WHAT YOU MAY NEED)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-ink-charcoal/80 mb-3 font-mono-tag uppercase font-bold tracking-wide">Yang dibutuhkan saat ini:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentNeeds.map((need, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-full bg-white border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold shadow-[2px_2px_0px_#171717]"
                          >
                            {need}
                          </span>
                        ))}
                      </div>
                    </div>
                    {needInsight?.explanation && (
                      <div className="pt-2 border-t border-ink-charcoal/10">
                        <span className="block text-ink-charcoal/80 mb-1 font-mono-tag uppercase text-[10px] font-bold tracking-wide">Penjelasan:</span>
                        <p className="text-ink-charcoal text-xs italic leading-relaxed">{needInsight.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. ACTION */}
                <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_#171717]">
                  <div className="flex items-center justify-between border-b border-ink-charcoal/20 pb-3 mb-4 font-mono-tag text-xs font-bold uppercase">
                    <div className="flex items-center gap-2">
                      <span className="bg-marker-orange text-ink-charcoal px-2 py-0.5 rounded-sm border border-ink-charcoal">04</span>
                      <span>LANGKAH KECIL (YOUR NEXT STEP)</span>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base font-headline italic font-bold text-ink-charcoal px-2">
                    “{currentAction}”
                  </p>
                </div>
              </div>


              {/* AI Error state */}
              {error && !summaryData && (
                <div className="max-w-xl mx-auto mt-6">
                  <AIErrorCard
                    title="Refleksi Penutup Belum Terhubung"
                    message={error}
                    technicalError={technicalError}
                    onRetry={() => fetchSummary(true)}
                    isRetrying={loading}
                    continueUrl="/complete"
                    continueLabel="Tetap Selesaikan Perjalanan"
                  />
                </div>
              )}

              {/* Reflection synthesis note */}
              {summaryData?.reflection && (
                <div className="bg-[#FFF4DC] border-[1.5px] border-ink-charcoal rounded-xl p-6 sm:p-8 shadow-[4px_4px_0px_#171717] -rotate-1 mt-10 w-full max-w-lg mx-auto text-center">
                  <span className="font-mono-tag text-[12px] text-ink-charcoal/60 uppercase font-bold block mb-3">
                    Catatan Penutup
                  </span>
                  <p className="font-script text-xl sm:text-2xl text-burnt-orange font-bold leading-snug">
                    “{summaryData.reflection}”
                  </p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t-[1.5px] border-ink-charcoal/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-paper-base text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs uppercase shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>{downloaded ? "✓ Tersimpan di Perangkat" : "Unduh File Rangkuman"}</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Hidden Receipt for PDF Export */}
      <div className="fixed top-[200vh] left-[200vw] pointer-events-none opacity-0">
        <div id="receipt-export-content" className="w-[380px] bg-[#FFF8F2] border-[2px] border-ink-charcoal p-6 font-mono-tag text-ink-charcoal">
          {/* Header */}
          <div className="text-center border-b-[2px] border-dashed border-ink-charcoal pb-4 mb-4">
            <h2 className="font-headline font-bold text-2xl uppercase tracking-widest mb-1">UNMASKED</h2>
            <p className="text-[10px] uppercase font-bold tracking-wider">Tanda Terima Refleksi Batin</p>
            <p className="text-[10px] mt-1">{new Date().toLocaleDateString("id-ID")} - {new Date().toLocaleTimeString("id-ID")}</p>
          </div>

          {/* Items */}
          <div className="space-y-4 text-[12px] leading-relaxed">
            <div>
              <p className="font-bold border-b-[1.5px] border-ink-charcoal/30 pb-1 mb-1 uppercase tracking-wide">01. TAMPILAN LUAR & RUANG BATIN</p>
              <p><span className="text-ink-charcoal/70">Yang Ditampilkan:</span> {currentPublicTags.join(" · ")}</p>
              <p><span className="text-ink-charcoal/70">Yang Dirasakan:</span> {currentActualFeelings.join(" · ")}</p>
            </div>
            <div>
              <p className="font-bold border-b-[1.5px] border-ink-charcoal/30 pb-1 mb-1 uppercase tracking-wide">02. BEBAN PIKIRAN</p>
              <ul className="list-none space-y-1 mb-2">
                {currentThemes.map((t, i) => <li key={i}>- {t}</li>)}
              </ul>
              <p className="text-ink-charcoal/80 italic">Catatan: {loadInsight?.summary || "-"}</p>
            </div>
            <div>
              <p className="font-bold border-b-[1.5px] border-ink-charcoal/30 pb-1 mb-1 uppercase tracking-wide">03. KEBUTUHAN DIRI</p>
              <ul className="list-none space-y-1 mb-2">
                {currentNeeds.map((n, i) => <li key={i}>- {n}</li>)}
              </ul>
              <p className="text-ink-charcoal/80 italic">Penjelasan: {needInsight?.explanation || "-"}</p>
            </div>
            <div>
              <p className="font-bold border-b-[1.5px] border-ink-charcoal/30 pb-1 mb-1 uppercase tracking-wide">04. LANGKAH KECIL</p>
              <p className="font-headline italic font-bold text-[14px]">&quot;{currentAction}&quot;</p>
            </div>

            {summaryData?.reflection && (
              <div className="mt-4 pt-4 border-t-[1.5px] border-ink-charcoal/30 text-center bg-[#FFF4DC] border-[1.5px] border-ink-charcoal p-4 rounded-xl -rotate-1 mt-6">
                <p className="font-mono-tag text-[10px] uppercase font-bold text-ink-charcoal/60 mb-2">CATATAN PENUTUP</p>
                <p className="font-script text-xl text-burnt-orange font-bold leading-snug">&quot;{summaryData.reflection}&quot;</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center border-t-[2px] border-dashed border-ink-charcoal pt-5 mt-5">
            <div className="w-10 h-10 mx-auto border-[1.5px] border-ink-charcoal rounded-full flex items-center justify-center mb-3 -rotate-6">
              <span className="material-symbols-outlined text-[20px]">done_all</span>
            </div>
            <p className="font-script text-xl text-burnt-orange mb-2">&quot;look how much you unpacked&quot;</p>
            <p className="text-[10px] uppercase font-bold tracking-widest mt-2">Beyond &quot;I&apos;m Fine&quot;</p>
          </div>
        </div>
      </div>

      <BottomDock
        backTo="/action-step"
        nextTo="/complete"
        nextLabel="Selesai"
        stageBadge="RANGKUMAN"
      />
    </div>
  );
}
