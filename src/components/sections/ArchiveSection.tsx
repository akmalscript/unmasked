"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";
import { Header } from "@/components/Header";

export function ArchiveSection() {
  const router = useRouter();
  const { summaryData, sessionId, lastActiveTimestamp, resetSession, actualFeelings, loadInsight, needInsight } = useJournalStore();
  const isHydrated = useStoreHydrated();

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-8">
      <Header />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-12 flex flex-col items-center">
        {/* Heading Section */}
        <section className="w-full max-w-2xl text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-2 bg-marker-orange text-ink-charcoal font-mono-tag text-xs uppercase px-3 py-1 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] -rotate-2 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-charcoal animate-pulse"></span>
              ARSIP LOKAL
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase mb-2">
            arsip refleksi
          </h1>
          <p className="text-sm sm:text-base text-ink-charcoal/80 mt-2">
            Menampilkan sesi refleksi terakhirmu secara lokal di perangkat ini.
          </p>
        </section>

        <div className="w-full">
          {!summaryData ? (
            <div className="max-w-xl mx-auto text-center bg-paper-warm border-[1.5px] border-ink-charcoal shadow-[4px_4px_0px_#171717] p-8 md:p-12 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-ink-charcoal/40 mb-4">archive</span>
              <h2 className="text-xl font-bold text-ink-charcoal mb-2">Belum Ada Arsip</h2>
              <p className="text-ink-charcoal/70 mb-6">Kamu belum menyelesaikan atau menyimpan sesi refleksi.</p>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold uppercase shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] transition-all"
              >
                Mulai Sesi Baru
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
              <div className="bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[5px_5px_0px_#171717] p-5 sm:p-8 relative">
                <div className="absolute -top-3.5 right-4 sm:right-8 px-3 py-1 bg-sticker-sage border-[1.5px] border-ink-charcoal rounded-sm font-mono-tag text-[10px] sm:text-xs text-ink-charcoal rotate-2 shadow-[2px_2px_0px_#171717] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  Sesi: {new Date(lastActiveTimestamp).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>

                <div className="mt-4 pt-2">
                  <div className="bg-[#FFFDF9] border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-xl p-5 sm:p-6 space-y-5">
                    
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b-[1.5px] border-dashed border-ink-charcoal/20">
                      <div>
                        <span className="font-mono-tag text-[9px] text-ink-charcoal/50 uppercase block font-bold tracking-widest mb-1">Mulai Sesi</span>
                        <div className="inline-flex items-center gap-1 font-headline text-sm font-bold text-ink-charcoal">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {new Date(parseInt(sessionId.split('-')[1]) || lastActiveTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </div>
                      <div>
                        <span className="font-mono-tag text-[9px] text-ink-charcoal/50 uppercase block font-bold tracking-widest mb-1">Selesai Sesi</span>
                        <div className="inline-flex items-center gap-1 font-headline text-sm font-bold text-ink-charcoal">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          {new Date(lastActiveTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </div>
                    </div>

                    {/* 1. MASK */}
                    <div>
                      <h4 className="font-mono-tag text-[10px] text-ink-charcoal/50 uppercase font-bold tracking-widest mb-2">01 — Tampilan & Batin</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="text-ink-charcoal/70">Ditampilkan:</span> <strong>{summaryData?.whatYouShow?.join(" · ")}</strong></p>
                        <p><span className="text-ink-charcoal/70">Dirasakan:</span> <strong>{actualFeelings?.join(" · ")}</strong></p>
                      </div>
                    </div>

                    <div className="w-full border-t-[1.5px] border-dashed border-ink-charcoal/20"></div>

                    {/* 2. LOAD */}
                    <div>
                      <h4 className="font-mono-tag text-[10px] text-ink-charcoal/50 uppercase font-bold tracking-widest mb-2">02 — Beban Pikiran</h4>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {summaryData?.whatYouCarry?.map((carry, idx) => (
                          <span key={idx} className="bg-paper-warm px-2 py-0.5 rounded-sm border-[1.5px] border-ink-charcoal font-mono-tag text-[10px] font-bold">{carry}</span>
                        ))}
                      </div>
                      {loadInsight?.summary && (
                        <p className="text-xs text-ink-charcoal/80 italic mt-2">
                          Catatan: {loadInsight.summary}
                        </p>
                      )}
                    </div>

                    <div className="w-full border-t-[1.5px] border-dashed border-ink-charcoal/20"></div>

                    {/* 3. NEED */}
                    <div>
                      <h4 className="font-mono-tag text-[10px] text-ink-charcoal/50 uppercase font-bold tracking-widest mb-2">03 — Kebutuhan Diri</h4>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {summaryData?.whatYouMayNeed?.map((need, idx) => (
                          <span key={idx} className="bg-paper-warm px-2 py-0.5 rounded-sm border-[1.5px] border-ink-charcoal font-mono-tag text-[10px] font-bold">{need}</span>
                        ))}
                      </div>
                      {needInsight?.explanation && (
                        <p className="text-xs text-ink-charcoal/80 italic mt-2">
                          Penjelasan: {needInsight.explanation}
                        </p>
                      )}
                    </div>

                    <div className="w-full border-t-[1.5px] border-dashed border-ink-charcoal/20"></div>

                    {/* 4. ACTION */}
                    <div>
                      <h4 className="font-mono-tag text-[10px] text-ink-charcoal/50 uppercase font-bold tracking-widest mb-2">04 — Langkah Kecil</h4>
                      <p className="text-sm font-headline italic font-bold">&quot;{summaryData?.nextStep}&quot;</p>
                    </div>
                    
                    {/* REFLECTION */}
                    {summaryData?.reflection && (
                      <>
                        <div className="w-full border-t-[1.5px] border-dashed border-ink-charcoal/20"></div>
                        <div className="text-center bg-[#FFF4DC] border-[1.5px] border-ink-charcoal p-4 rounded-lg">
                          <span className="block font-mono-tag text-[9px] uppercase font-bold text-ink-charcoal/50 mb-1">Catatan Penutup</span>
                          <p className="font-script text-xl text-burnt-orange font-bold leading-snug">
                            &quot;{summaryData.reflection}&quot;
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full mt-4">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-paper-base text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-3 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
                >
                  <span className="material-symbols-outlined text-[16px]">home</span>
                  <span>Kembali ke Beranda</span>
                </Link>
                <button
                  onClick={() => {
                    resetSession();
                    router.push("/onboarding");
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-6 py-3 font-mono-tag text-xs font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  <span>Mulai Refleksi Baru</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
