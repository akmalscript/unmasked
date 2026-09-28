"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { useRouter } from "next/navigation";
import { useJournalStore, useStoreHydrated } from "@/store/useJournalStore";

const FEELING_OPTIONS = [
  "Lelah",
  "Cemas",
  "Kewalahan",
  "Sedih",
  "Kesepian",
  "Bingung",
  "Marah",
  "Hampa",
  "Biasa saja",
  "Tenang",
  "Termotivasi",
];

export function ActualFeelingSection() {
  const { publicTags, actualFeelings, toggleActualFeeling, addCustomActualFeeling, feelingNote, setFeelingNote } = useJournalStore();
  const isHydrated = useStoreHydrated();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isHydrated && publicTags.length === 0) {
      router.replace("/public-self");
    }
  }, [isHydrated, publicTags, router]);

  useEffect(() => {
    if (showModal) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showModal]);

  const handleOpenModal = () => {
    setCustomInput("");
    setShowModal(true);
  };

  const handleConfirm = () => {
    if (customInput.trim()) {
      addCustomActualFeeling(customInput.trim());
    }
    setShowModal(false);
    setCustomInput("");
  };

  const handleCancel = () => {
    setShowModal(false);
    setCustomInput("");
  };
  const selected = actualFeelings;

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-20">
      <Header subtitle="MASK 02/03" showSteps={true} stepNumber={1} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-10 pt-4 sm:pt-6 pb-6">

        <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl shadow-[4px_4px_0px_#171717] p-5 sm:p-7 md:p-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Heading, Subtitle, Tagline, Tags, Catatan Bebas */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="mb-2">
                <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-charcoal lowercase tracking-tight leading-snug mb-2">
                  “bagaimana kamu benar-benar merasa?”
                </h1>
                <p className="text-sm md:text-base text-ink-charcoal/80 leading-relaxed mb-3">
                  Pilih beberapa kata yang paling menggambarkan perasaanmu saat ini. Tidak perlu disaring, tidak perlu ditutupi.
                </p>

                {/* Tagline: what's underneath? with striped pencil */}
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="font-script text-marker-orange text-xl sm:text-2xl font-bold tracking-wide">
                    “what&apos;s underneath?”
                  </span>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline-block shrink-0 -rotate-12"
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
                </div>
              </div>

              {/* Feelings tags */}
              <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6">
                {FEELING_OPTIONS.map((item) => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleActualFeeling(item)}
                      type="button"
                      className={`select-none flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] font-mono-tag text-xs sm:text-sm transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                        isSelected
                          ? "bg-paper-warm text-ink-charcoal font-bold"
                          : "bg-paper-base text-ink-charcoal hover:bg-paper-warm"
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          isSelected
                            ? "bg-marker-orange border border-ink-charcoal"
                            : "border-[1.5px] border-ink-charcoal bg-transparent"
                        }`}
                      />
                      <span>{item}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[15px] font-bold text-ink-charcoal">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Any custom feelings */}
                {selected
                  .filter((t) => !FEELING_OPTIONS.includes(t))
                  .map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleActualFeeling(t)}
                      type="button"
                      className="select-none flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] font-mono-tag text-xs sm:text-sm transition-all bg-paper-warm text-ink-charcoal font-bold"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-ink-charcoal bg-marker-orange" />
                      <span>{t}</span>
                      <span className="material-symbols-outlined text-[15px] font-bold text-ink-charcoal">
                        check
                      </span>
                    </button>
                  ))}
              </div>

              {/* Catatan Bebas (Opsional) */}
              <div className="bg-paper-warm rounded-xl border-[1.5px] border-ink-charcoal p-4 sm:p-5 shadow-[3px_3px_0px_#171717]">
                <label
                  className="font-mono-tag text-xs uppercase tracking-wider text-ink-charcoal font-bold flex items-center gap-2 mb-2.5"
                  htmlFor="inner-note"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  CATATAN BEBAS (OPSIONAL)
                </label>
                <textarea
                  className="w-full bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl p-3.5 text-xs sm:text-sm text-ink-charcoal placeholder:text-ink-charcoal/40 focus:outline-none focus:ring-2 focus:ring-marker-orange resize-none shadow-[inset_1px_1px_2px_rgba(0,0,0,0.04)]"
                  id="inner-note"
                  placeholder="Jika ada kata lain yang ingin kamu luapkan sekarang..."
                  rows={2}
                  maxLength={500}
                  value={feelingNote || ""}
                  onChange={(e) => setFeelingNote(e.target.value.slice(0, 500))}
                />
              </div>
            </div>

            {/* Right Column: Pink Card & Sage Green Card */}
            <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6 pt-1 lg:pt-3">
              {/* Pink Card: Ruang Otentik */}
              <div className="bg-sticker-pink border-[1.5px] border-ink-charcoal rounded-2xl p-6 shadow-[3px_3px_0px_#171717] rotate-1 hover:rotate-0 transition-transform duration-300 flex flex-col items-center text-center">
                {/* Character Arch Illustration */}
                <div className="relative mb-3">
                  <svg
                    width="76"
                    height="88"
                    viewBox="0 0 76 88"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[1.5px_1.5px_0px_#171717]"
                  >
                    {/* Arch body */}
                    <path
                      d="M2 38C2 18.1177 18.1177 2 38 2C57.8823 2 74 18.1177 74 38V84C74 85.1046 73.1046 86 72 86H4C2.89543 86 2 85.1046 2 84V38Z"
                      fill="white"
                      stroke="#171717"
                      strokeWidth="2.5"
                    />
                    {/* Left Eye */}
                    <rect x="23" y="40" width="8" height="4" rx="1" fill="#171717" />
                    {/* Right Eye */}
                    <rect x="45" y="40" width="8" height="4" rx="1" fill="#171717" />
                    {/* Mouth */}
                    <rect x="33" y="52" width="10" height="3" rx="1" fill="#171717" />
                  </svg>
                </div>

                {/* Badge: RUANG OTENTIK */}
                <div className="bg-white border-[1.5px] border-ink-charcoal rounded-md px-3.5 py-1 shadow-[1.5px_1.5px_0px_#171717] mb-3">
                  <span className="font-mono-tag text-[10px] sm:text-[11px] font-bold text-ink-charcoal uppercase tracking-wider">
                    RUANG OTENTIK
                  </span>
                </div>

                {/* Quote */}
                <p className="font-script text-xs sm:text-[13px] text-ink-charcoal/90 italic leading-relaxed max-w-[210px]">
                  “Di balik kata &apos;baik-baik saja&apos;, ada jiwa yang hanya butuh diakui lelahnya.”
                </p>
              </div>

              {/* Sage Green Card: Pengingat Kecil */}
              <div className="bg-sticker-sage border-[1.5px] border-ink-charcoal rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#171717]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[20px] text-ink-charcoal">
                    lightbulb
                  </span>
                  <span className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal">
                    PENGINGAT KECIL
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-ink-charcoal/90 leading-relaxed font-sans">
                  Semua emosi valid. Mengakui kewalahan adalah langkah awal kembali bernapas lega.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomDock backTo="/public-self" nextTo="/mask-result" centerLabel="" stageBadge="MASK 02/03" isNextDisabled={selected.length === 0} />

      {/* Custom Feeling Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          onClick={handleCancel}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink-charcoal/40 backdrop-blur-sm" />

          {/* Modal Card */}
          <div
            className="relative w-full max-w-sm bg-paper-base border-[1.5px] border-ink-charcoal rounded-2xl shadow-[6px_6px_0px_#171717] p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Washi tape top */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 washi-tape w-28 h-6 rounded-[2px] flex items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono-tag tracking-widest text-ink-charcoal/50 uppercase font-bold">TAMBAH KATA</span>
            </div>

            {/* Header modal */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-paper-warm border-[1.5px] border-ink-charcoal flex items-center justify-center shadow-[1px_1px_0px_#171717]">
                <span className="material-symbols-outlined text-ink-charcoal text-[15px]">edit</span>
              </div>
              <div>
                <p className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal">Perasaan Baru</p>
                <p className="font-mono-tag text-[10px] text-ink-charcoal/60">Perasaan yang menggambarkan kondisimu</p>
              </div>
            </div>

            {/* Input */}
            <div className="relative mb-5">
              <input
                ref={inputRef}
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                  if (e.key === "Escape") handleCancel();
                }}
                placeholder="mis. Kecewa, Lega, Ragu..."
                maxLength={30}
                className="w-full bg-paper-warm border-[1.5px] border-ink-charcoal rounded-xl px-4 py-3 font-mono-tag text-sm text-ink-charcoal placeholder:text-ink-charcoal/40 focus:outline-none focus:ring-2 focus:ring-marker-orange focus:border-marker-orange transition-all shadow-[2px_2px_0px_#171717]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono-tag text-[10px] text-ink-charcoal/40">
                {customInput.length}/30
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-full border-[1.5px] border-ink-charcoal bg-paper-warm text-ink-charcoal font-mono-tag text-xs font-semibold shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!customInput.trim()}
                className="flex-1 px-4 py-2.5 rounded-full border-[1.5px] border-ink-charcoal bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold shadow-[2px_2px_0px_#171717] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[2px_2px_0px_#171717] transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">check</span>
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
