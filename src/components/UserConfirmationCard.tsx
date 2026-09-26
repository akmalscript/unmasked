"use client";

import React, { useState } from "react";
import { UserConfirmation, ConfirmationStatus } from "@/types/session";

interface Props {
  currentConfirmation: UserConfirmation | null;
  onConfirm: (conf: UserConfirmation) => void;
  title?: string;
  subtitle?: string;
}

export function UserConfirmationCard({
  currentConfirmation,
  onConfirm,
  title = "Apakah interpretasi ini terasa sesuai denganmu?",
  subtitle = "AI kami hanya bertindak sebagai cermin pemantul. Kamu tetap yang paling memahami dirimu sendiri.",
}: Props) {
  const [status, setStatus] = useState<ConfirmationStatus>(
    currentConfirmation?.status || "accepted"
  );
  const [correction, setCorrection] = useState<string>(
    currentConfirmation?.correction || ""
  );
  const [saved, setSaved] = useState<boolean>(!!currentConfirmation);

  const handleSelectStatus = (newStatus: ConfirmationStatus) => {
    setStatus(newStatus);
    const updated: UserConfirmation = {
      status: newStatus,
      correction: newStatus === "accepted" ? undefined : correction,
      confirmedAt: new Date().toISOString(),
    };
    onConfirm(updated);
    setSaved(true);
  };

  const handleSaveCorrection = () => {
    const updated: UserConfirmation = {
      status,
      correction: correction.trim() || undefined,
      confirmedAt: new Date().toISOString(),
    };
    onConfirm(updated);
    setSaved(true);
  };

  return (
    <div className="w-full bg-paper-warm/80 border-[1.5px] border-ink-charcoal rounded-xl p-5 shadow-[3px_3px_0px_#171717] mt-6">
      <div className="flex items-center gap-2 mb-1.5 font-mono-tag text-xs font-bold uppercase text-ink-charcoal">
        <span className="material-symbols-outlined text-[16px] text-ink-charcoal">
          verified_user
        </span>
        <span>Validasi & Kendali Pengguna</span>
      </div>

      <p className="font-headline font-semibold text-sm sm:text-base text-ink-charcoal mb-1">
        {title}
      </p>
      <p className="text-xs text-ink-charcoal/70 mb-4">{subtitle}</p>

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 mb-3">
        <button
          type="button"
          onClick={() => handleSelectStatus("accepted")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold transition-all shadow-[1.5px_1.5px_0px_#171717] ${
            status === "accepted"
              ? "bg-sticker-sage text-ink-charcoal ring-1 ring-ink-charcoal"
              : "bg-paper-base hover:bg-paper-warm text-ink-charcoal"
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">check_circle</span>
          <span>Ya, sesuai</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectStatus("partially_accepted")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold transition-all shadow-[1.5px_1.5px_0px_#171717] ${
            status === "partially_accepted"
              ? "bg-marker-orange/80 text-ink-charcoal ring-1 ring-ink-charcoal"
              : "bg-paper-base hover:bg-paper-warm text-ink-charcoal"
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">adjust</span>
          <span>Sebagian sesuai</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectStatus("rejected")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.5px] border-ink-charcoal font-mono-tag text-xs font-bold transition-all shadow-[1.5px_1.5px_0px_#171717] ${
            status === "rejected"
              ? "bg-sticker-pink text-ink-charcoal ring-1 ring-ink-charcoal"
              : "bg-paper-base hover:bg-paper-warm text-ink-charcoal"
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">cancel</span>
          <span>Kurang tepat</span>
        </button>
      </div>

      {/* Optional correction box if not fully accepted */}
      {(status === "partially_accepted" || status === "rejected") && (
        <div className="pt-2 border-t border-ink-charcoal/15 mt-3 space-y-2">
          <label className="font-mono-tag text-xs text-ink-charcoal/80 block">
            Apa yang lebih menggambarkan situasimu sebenarnya? (Koreksimu akan menjadi acuan AI pada tahap berikutnya)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={correction}
              onChange={(e) => setCorrection(e.target.value)}
              placeholder="mis. Saya lebih terbebani oleh ekspektasi keluarga..."
              className="flex-1 bg-paper-base border-[1.5px] border-ink-charcoal rounded-lg px-3 py-2 text-xs sm:text-sm font-mono-tag text-ink-charcoal focus:outline-none focus:ring-1 focus:ring-marker-orange shadow-[1px_1px_0px_#171717]"
            />
            <button
              type="button"
              onClick={handleSaveCorrection}
              className="w-full sm:w-auto px-4 py-2 bg-marker-orange border-[1.5px] border-ink-charcoal rounded-lg font-mono-tag text-xs font-bold shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              Simpan Koreksi
            </button>
          </div>
        </div>
      )}

      {saved && (
        <p className="font-mono-tag text-[11px] text-burnt-orange font-semibold mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">done_all</span>
          Responmu tercatat dan tersimpan untuk tahap berikutnya.
        </p>
      )}
    </div>
  );
}
