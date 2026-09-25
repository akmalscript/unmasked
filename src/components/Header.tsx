"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useJournalStore } from "@/store/useJournalStore";
import { CrisisModal } from "@/components/CrisisModal";

interface HeaderProps {
  subtitle?: string;
  showSteps?: boolean;
  stepNumber?: number;
  totalSteps?: number;
}

export function Header({
  subtitle = "",
  showSteps = false,
  stepNumber = 1,
  totalSteps = 4,
}: HeaderProps) {
  const { bookmarked, toggleBookmarked } = useJournalStore();
  const [showHelp, setShowHelp] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);

  return (
    <header className="relative z-40 w-full bg-paper-base  border-b-[1.5px] border-ink-charcoal dark:border-outline shadow-[0px_2px_0px_#171717] dark:shadow-none sticky top-0">
      <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-[1120px] mx-auto py-3.5">
        <div className="flex items-center gap-3">
          <Link
            className="font-headline text-xl font-bold tracking-tight text-ink-charcoal uppercase hover:text-burnt-orange transition-colors flex items-center gap-2"
            href="/"
          >
            <span className="w-3.5 h-3.5 bg-marker-orange border-[1.5px] border-ink-charcoal rotate-45 inline-block shadow-[1px_1px_0px_#171717]"></span>
            UNMASKED
          </Link>
          {subtitle && (
            <span className="hidden sm:inline-block font-mono-tag text-[11px] font-semibold text-ink-charcoal/80 bg-paper-warm border-[1.5px] border-ink-charcoal px-2.5 py-0.5 rounded-full shadow-[1px_1px_0px_#171717]">
              {subtitle}
            </span>
          )}
        </div>

        {showSteps && (
          <div className="hidden sm:flex items-center gap-1.5 md:gap-2 font-mono-tag text-xs tracking-wider bg-paper-warm border-[1.5px] border-ink-charcoal px-3.5 py-1.5 rounded-full shadow-[2px_2px_0px_#171717]">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s, idx) => (
              <React.Fragment key={s}>
                <span
                  className={
                    s === stepNumber
                      ? "text-marker-orange text-sm font-bold leading-none"
                      : s < stepNumber
                        ? "text-ink-charcoal text-sm leading-none"
                        : "text-ink-charcoal/40 text-sm leading-none"
                  }
                >
                  {s <= stepNumber ? "●" : "○"}
                </span>
                {idx < totalSteps - 1 && <span className="text-ink-charcoal/30 text-xs">—</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCrisis(true)}
            aria-label="Bantuan Krisis"
            className="cursor-pointer p-2 border-[1.5px] border-ink-charcoal rounded-full bg-sticker-pink/50 text-ink-charcoal shadow-[2px_2px_0px_#171717] hover:bg-sticker-pink transition-all flex items-center justify-center"
            title="Layanan Dukungan & Bantuan Krisis"
          >
            <span className="material-symbols-outlined text-[18px] text-burnt-orange">support_agent</span>
          </button>
          <button
            onClick={toggleBookmarked}
            aria-label="Simpan Bookmark"
            className={`cursor-pointer p-2 border-[1.5px] border-ink-charcoal rounded-full ${bookmarked ? "bg-marker-orange text-white" : "bg-paper-warm text-ink-charcoal"
              } shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center`}
            title={bookmarked ? "Tersimpan" : "Simpan Sesi"}
          >
            <span className="material-symbols-outlined text-[18px]">bookmark</span>
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            aria-label="Bantuan"
            className="cursor-pointer p-2 border-[1.5px] border-ink-charcoal rounded-full bg-paper-warm shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center text-ink-charcoal"
            title="Bantuan & Privasi"
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
          </button>
          <Link
            href="/selesai"
            className="hidden lg:inline-flex items-center gap-1.5 font-mono-tag text-xs font-semibold px-3 py-1.5 rounded-full border-[1.5px] border-ink-charcoal bg-paper-warm text-ink-charcoal hover:bg-surface-variant transition-transform active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span>Riwayat Sesi</span>
          </Link>
        </div>
      </div>

      {showHelp && (
        <div className="bg-sticker-sage/20 border-b-[1.5px] border-ink-charcoal px-6 py-2.5 text-center text-xs text-ink-charcoal flex items-center justify-center gap-3">
          <span className="material-symbols-outlined text-sm text-burnt-orange">lock</span>
          <span>
            Semua data hanya tersimpan di perangkat ini. Tidak ada yang bisa mengaksesnya selain kamu.
          </span>
          <button
            onClick={() => setShowHelp(false)}
            className="cursor-pointer underline text-burnt-orange font-bold text-xs hover:text-ink-charcoal transition-colors"
          >
            tutup
          </button>
        </div>
      )}

      <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />
    </header>
  );
}
