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

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 pt-6 md:pt-12">

        <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[4px_4px_0px_#171717] p-4 sm:p-6 md:p-8">
          {/* Desktop Sticker Badge */}
          <aside className="hidden md:flex absolute -top-8 right-8 z-10 rotate-6 hover:rotate-2 transition-transform duration-300">
            <div className="bg-sticker-blue border-[1.5px] border-ink-charcoal rounded-xl p-3 md:p-4 shadow-[3px_3px_0px_#171717] flex flex-col items-center max-w-[130px]">
              <div className="w-12 h-12 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal flex items-center justify-center mb-1 shadow-[1px_1px_0px_#171717]">
                <span className="material-symbols-outlined text-2xl text-ink-charcoal">
                  theater_comedy
                </span>
              </div>
            </div>
          </aside>

          {/* Mobile Badge - Clean inline position so it never overlaps the title */}
          <div className="md:hidden flex items-center gap-2 mb-3 bg-sticker-blue/30 border border-ink-charcoal px-3 py-1 rounded-lg w-fit shadow-[1px_1px_0px_#171717]">
            <span className="material-symbols-outlined text-[16px] text-ink-charcoal">
              theater_comedy
            </span>
            <span className="font-mono-tag text-[10px] font-bold text-ink-charcoal uppercase tracking-wider">
              ACTUAL FEELING · LAPISAN KEDUA
            </span>
          </div>
          <div className="max-w-[800px] mb-4 sm:mb-6">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-charcoal lowercase tracking-tight leading-snug mb-2">
              “bagaimana perasaanmu sebenarnya?”
            </h1>
            <p className="text-sm md:text-base text-ink-charcoal/90">
              Pilih beberapa kata yang paling menggambarkan perasaanmu saat ini.
            </p>
          </div>

          <div className="w-full">
            <div className="w-full">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {FEELING_OPTIONS.map((item) => {
                  const isSelected = selected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleActualFeeling(item)}
                      type="button"
                      className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] font-mono-tag text-xs sm:text-sm transition-all ${isSelected
                        ? "bg-paper-warm text-ink-charcoal font-bold"
                        : "bg-paper-base text-ink-charcoal hover:bg-paper-warm"
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full border border-ink-charcoal ${isSelected ? "bg-marker-orange" : "bg-transparent"
                          }`}
                      ></span>
                      <span>{item}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-ink-charcoal font-bold">
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
                      className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] font-mono-tag text-xs sm:text-sm transition-all bg-paper-warm text-ink-charcoal font-bold"
                    >
                      <span className="w-2 h-2 rounded-full border border-ink-charcoal bg-marker-orange"></span>
                      <span>{t}</span>
                      <span className="material-symbols-outlined text-[16px] text-ink-charcoal font-bold">
                        check
                      </span>
                    </button>
                  ))}

                <button
                  onClick={handleOpenModal}
                  type="button"
                  className="select-none flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border-[1.5px] border-dashed border-ink-charcoal bg-paper-warm/60 text-ink-charcoal font-mono-tag text-xs sm:text-sm shadow-[1px_1px_0px_#171717] hover:bg-paper-warm transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Lainnya...</span>
                </button>
              </div>

              <div className="mt-4 p-4 bg-paper-warm rounded-lg border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717]">
                <label
                  className="font-mono-tag text-xs uppercase tracking-wider text-ink-charcoal font-bold flex items-center gap-1.5 mb-2"
                  htmlFor="inner-note"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Catatan Bebas (Opsional)
                </label>
                <textarea
                  className="w-full bg-paper-base border-[1.5px] border-ink-charcoal rounded-lg p-3 text-xs sm:text-sm text-ink-charcoal placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-marker-orange resize-none"
                  id="inner-note"
                  placeholder="Jika ada kata lain yang ingin kamu luapkan sekarang..."
                  rows={2}
                  maxLength={500}
                  value={feelingNote || ""}
                  onChange={(e) => setFeelingNote(e.target.value.slice(0, 500))}
                ></textarea>
              </div>
            </div>

          </div>
        </div>
      </main>

      <BottomDock backTo="/public-self" nextTo="/mask-result" centerLabel="" isNextDisabled={selected.length === 0} />

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
