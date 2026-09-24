"use client";

import React from "react";
import Link from "next/link";

interface BottomDockProps {
  backTo?: string;
  nextTo?: string;
  backLabel?: string;
  nextLabel?: string;
  centerLabel?: string;
}

export function BottomDock({
  backTo,
  nextTo,
  backLabel = "Kembali",
  nextLabel = "Lanjutkan",
  centerLabel = "",
}: BottomDockProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-paper-warm border-t-[1.5px] border-ink-charcoal dark:border-outline shadow-[0px_-2px_0px_#171717] dark:shadow-none">
      <div className="max-w-[1120px] mx-auto px-6 md:px-12 py-3.5 flex justify-between items-center">
        {backTo ? (
          <Link
            href={backTo}
            className="flex items-center gap-2 bg-paper-base dark:bg-surface text-ink-charcoal  border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-5 md:px-6 py-2 font-mono-tag text-xs md:text-sm font-semibold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{backLabel}</span>
          </Link>
        ) : (
          <div />
        )}

        {centerLabel && (
          <div className="hidden sm:flex items-center gap-2 text-ink-charcoal/70 font-mono-tag text-xs">
            <span className="w-2 h-2 rounded-full bg-marker-orange inline-block"></span>
            <span>{centerLabel}</span>
          </div>
        )}

        {nextTo ? (
          <Link
            href={nextTo}
            className="flex items-center gap-2 bg-marker-orange text-ink-charcoal border-[1.5px] border-ink-charcoal shadow-[3px_3px_0px_#171717] rounded-full px-5 md:px-7 py-2 font-mono-tag text-xs md:text-sm font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all duration-150"
          >
            <span>{nextLabel}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
