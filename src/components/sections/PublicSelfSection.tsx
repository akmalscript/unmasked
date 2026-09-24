"use client";

import React, { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { useJournalStore } from "@/store/useJournalStore";

const ALL_TAGS = [
  "Produktif",
  "Kuat",
  "Ramah",
  "Percaya diri",
  "Santai",
  "Serius",
  "Ceria",
  "Pintar",
  "Mandiri",
  "Mudah bergaul",
  "Dewasa",
];

export function PublicSelfSection() {
  const { publicTags, togglePublicTag, addCustomPublicTag } = useJournalStore();
  const [showModal, setShowModal] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
      addCustomPublicTag(customInput.trim());
    }
    setShowModal(false);
    setCustomInput("");
  };

  const handleCancel = () => {
    setShowModal(false);
    setCustomInput("");
  };

  const selected = publicTags || ["Produktif", "Kuat"];

  return (
    <div className="min-h-screen flex flex-col bg-paper-base tactile-dot-grid pb-28">
      <Header subtitle="MASK 01/04" showSteps={true} stepNumber={1} totalSteps={4} />

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 md:px-12 pt-8 md:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-marker-orange text-ink-charcoal font-mono-tag text-xs font-bold px-3 py-1 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] flex items-center gap-1.5 uppercase">
              <span className="w-2 h-2 rounded-full bg-paper-base border border-ink-charcoal"></span>
              MASK
            </div>
            <span className="font-mono-tag text-xs text-ink-charcoal/70">
              Tahap 01 • Eksplorasi Persona Publik
            </span>
          </div>
        </div>

        <div className="relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[4px_4px_0px_#171717] p-6 sm:p-10 md:p-12 mb-10">
          <aside className="absolute -top-6 -right-3 md:-top-8 md:right-8 z-10 rotate-6 hover:rotate-2 transition-transform duration-300">
            <div className="bg-sticker-blue border-[1.5px] border-ink-charcoal rounded-xl p-3 md:p-4 shadow-[3px_3px_0px_#171717] flex flex-col items-center max-w-[130px]">
              <div className="w-12 h-12 rounded-full bg-paper-base border-[1.5px] border-ink-charcoal flex items-center justify-center mb-1 shadow-[1px_1px_0px_#171717]">
                <span className="material-symbols-outlined text-2xl text-ink-charcoal">
                  theater_comedy
                </span>
              </div>
              <span className="font-mono-tag text-[10px] font-bold text-ink-charcoal uppercase">
                PUBLIC SELF
              </span>
              <span className="text-[10px] text-ink-charcoal/80">lapisan pertama</span>
            </div>
          </aside>

          <div className="max-w-[700px] mb-8">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-ink-charcoal lowercase tracking-tight leading-snug mb-2">
              “bagaimana kamu terlihat di mata orang lain?”
            </h1>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-marker-orange text-xl rotate-45 select-none">
                subdirectory_arrow_right
              </span>
              <span className="font-mono-tag text-xs md:text-sm text-marker-orange font-bold italic">
                “the version they see.”
              </span>
            </div>
            <p className="text-sm md:text-base text-ink-charcoal/90">
              Pilih beberapa kata yang menurutmu menggambarkan dirimu di mata orang lain. Tidak ada
              penilaian benar atau salah—hanya kejujuran atas apa yang kamu tampilkan.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-[1.5px] border-ink-charcoal/20">
              <span className="font-mono-tag text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-ink-charcoal">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                Pilihan Sifat Publik
              </span>
              <span className="font-mono-tag text-xs text-ink-charcoal/70">
                {selected.length} kata dipilih
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2">
              {ALL_TAGS.map((tag) => {
                const isSelected = selected.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => togglePublicTag(tag)}
                    type="button"
                    className={`select-none flex items-center gap-2 px-4 py-2.5 rounded-full border-[1.5px] border-ink-charcoal font-mono-tag text-xs sm:text-sm transition-all shadow-[2px_2px_0px_#171717] active:translate-x-[2px] active:translate-y-[2px] ${
                      isSelected
                        ? "bg-paper-warm text-ink-charcoal font-bold"
                        : "bg-paper-base text-ink-charcoal hover:bg-paper-warm"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border border-ink-charcoal flex items-center justify-center text-[10px] ${
                        isSelected
                          ? "bg-marker-orange text-ink-charcoal"
                          : "bg-surface"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[11px] font-bold">
                          check
                        </span>
                      )}
                    </span>
                    <span>{tag}</span>
                  </button>
                );
              })}

              {/* Any custom tags */}
              {selected
                .filter((t) => !ALL_TAGS.includes(t))
                .map((t) => (
                  <button
                    key={t}
                    onClick={() => togglePublicTag(t)}
                    type="button"
                    className="select-none flex items-center gap-2 px-4 py-2.5 rounded-full border-[1.5px] border-ink-charcoal bg-paper-warm text-ink-charcoal font-mono-tag text-xs sm:text-sm font-bold shadow-[2px_2px_0px_#171717]"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-ink-charcoal bg-marker-orange flex items-center justify-center text-[10px] text-ink-charcoal">
                      <span className="material-symbols-outlined text-[11px] font-bold">
                        check
                      </span>
                    </span>
                    <span>{t}</span>
                  </button>
                ))}

              <button
                onClick={handleOpenModal}
                type="button"
                className="select-none flex items-center gap-1.5 px-4 py-2.5 rounded-full border-[1.5px] border-dashed border-ink-charcoal bg-paper-warm/60 text-ink-charcoal font-mono-tag text-xs sm:text-sm shadow-[1px_1px_0px_#171717] hover:bg-paper-warm transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Lainnya...</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t-[1.5px] border-dashed border-ink-charcoal/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 max-w-[620px]">
              <span className="material-symbols-outlined text-marker-orange text-2xl mt-0.5">
                tips_and_updates
              </span>
              <div>
                <h4 className="font-mono-tag text-xs font-bold text-ink-charcoal">
                  Catatan Pensil:
                </h4>
                <p className="text-xs text-ink-charcoal/80 leading-relaxed">
                  Topeng ini bukan tentang kebohongan, melainkan cara kita beradaptasi saat
                  berhadapan dengan dunia luar.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 border-[1.5px] border-ink-charcoal rounded bg-sticker-sage/30 text-ink-charcoal font-mono-tag text-[10px] uppercase tracking-wider rotate-1 shadow-[1.5px_1.5px_0px_#171717]">
              REFLEKSI AKTIF
            </div>
          </div>
        </div>
      </main>

      <BottomDock backTo="/checkin" nextTo="/actual-feeling" centerLabel="MASK: Persona Publik" />

      {/* Custom Tag Modal */}
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
                <p className="font-mono-tag text-xs font-bold uppercase tracking-wider text-ink-charcoal">Kata Persona Baru</p>
                <p className="font-mono-tag text-[10px] text-ink-charcoal/60">Kata sifat yang menggambarkan dirimu</p>
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
                placeholder="mis. Tekun, Kreatif, Empatik..."
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
