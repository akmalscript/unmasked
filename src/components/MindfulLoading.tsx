"use client";

import React, { useEffect, useState } from "react";

const CALM_MESSAGES = [
  "Sedang mengurai benang kusut pikiranmu perlahan...",
  "Mendengarkan tanpa prasangka...",
  "Melihat apa yang tersembunyi di balik kata-katamu...",
  "Tarik napas dalam, hembuskan perlahan...",
  "Menyusun pola dengan penuh kehati-hatian...",
];

export function MindfulLoading({ message }: { message?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % CALM_MESSAGES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-paper-warm/90 border-[1.5px] border-ink-charcoal rounded-2xl shadow-[4px_4px_0px_#171717] animate-pulse">
      <div className="w-12 h-12 rounded-full border-[1.5px] border-ink-charcoal bg-marker-orange flex items-center justify-center shadow-[2px_2px_0px_#171717] mb-4">
        <span className="material-symbols-outlined text-2xl text-ink-charcoal animate-spin">
          progress_activity
        </span>
      </div>

      <p className="font-headline text-lg sm:text-xl font-bold text-ink-charcoal mb-1">
        {message || CALM_MESSAGES[index]}
      </p>
      <p className="font-mono-tag text-xs text-ink-charcoal/60">
        Mohon tunggu sejenak, ruang ini sedang membaca refleksimu...
      </p>
    </div>
  );
}
