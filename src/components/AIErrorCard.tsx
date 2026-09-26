"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AIErrorCardProps {
  title?: string;
  message?: string;
  technicalError?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  continueUrl?: string;
  continueLabel?: string;
  onContinueManual?: () => void;
}

export function AIErrorCard({
  title = "Koneksi Telaah AI Terkendala",
  message = "Layanan AI sedang tidak dapat dijangkau saat ini. Catatan dan pilihan refleksimu tetap aman tersimpan di perangkat ini.",
  technicalError,
  onRetry,
  isRetrying = false,
  continueUrl,
  continueLabel = "Tetap Lanjut Tanpa Telaah AI",
  onContinueManual,
}: AIErrorCardProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (technicalError) {
      navigator.clipboard.writeText(technicalError);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-paper-warm border-[1.5px] border-ink-charcoal rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#171717] my-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start gap-3.5 mb-3">
        <div className="w-10 h-10 rounded-xl bg-sticker-pink border border-ink-charcoal flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#171717]">
          <span className="material-symbols-outlined text-ink-charcoal text-xl">cloud_off</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-burnt-orange inline-block"></span>
            <span className="font-mono-tag text-[10px] uppercase font-bold text-burnt-orange tracking-wider">
              Jeda Koneksi AI
            </span>
          </div>
          <h3 className="font-headline font-bold text-base sm:text-lg text-ink-charcoal">
            {title}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-ink-charcoal/80 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-ink-charcoal/15 mt-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold uppercase border-[1.5px] border-ink-charcoal shadow-[2.5px_2.5px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-60 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRetrying ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>{isRetrying ? "Menghubungkan..." : "Coba Analisis Ulang"}</span>
          </button>
        )}

        {continueUrl && (
          <Link
            href={continueUrl}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-paper-base text-ink-charcoal font-mono-tag text-xs font-semibold border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] hover:bg-paper-warm transition-all"
          >
            <span>{continueLabel}</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        )}

        {onContinueManual && !continueUrl && (
          <button
            type="button"
            onClick={onContinueManual}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-paper-base text-ink-charcoal font-mono-tag text-xs font-semibold border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] hover:bg-paper-warm transition-all cursor-pointer"
          >
            <span>{continueLabel}</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        )}

        {technicalError && (
          <button
            type="button"
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-[11px] font-mono-tag text-ink-charcoal/60 underline hover:text-ink-charcoal ml-auto cursor-pointer"
          >
            {showTechnical ? "Sembunyikan Detail Teknis" : "Lihat Detail Teknis"}
          </button>
        )}
      </div>

      {/* Collapsible Technical Error */}
      {showTechnical && technicalError && (
        <div className="mt-3 pt-3 border-t border-ink-charcoal/15 bg-paper-base p-3 rounded-xl border border-ink-charcoal/30 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono-tag text-[10px] font-bold text-ink-charcoal/70 uppercase">
              Rincian Error Teknis (Debug):
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] font-mono-tag px-2 py-0.5 rounded bg-paper-warm border border-ink-charcoal text-ink-charcoal hover:bg-sticker-pink transition-colors cursor-pointer"
            >
              {copied ? "✓ Tersalin" : "Salin Log"}
            </button>
          </div>
          <pre className="font-mono text-[11px] text-ink-charcoal/80 bg-paper-warm p-2 rounded overflow-x-auto whitespace-pre-wrap break-all leading-tight">
            {technicalError}
          </pre>
        </div>
      )}
    </div>
  );
}
