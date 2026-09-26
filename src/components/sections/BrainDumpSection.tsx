"use client";

import React, { useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomDock } from "@/components/BottomDock";
import { useJournalStore, StickyNote, StickyColor } from "@/store/useJournalStore";

const STICKERS = [
  "kuliah",
  "hubungan",
  "uang",
  "ekspektasi",
  "masa depan",
  "takut gagal",
];

const COLOR_MAP: Record<StickyColor, { bg: string; text: string }> = {
  pink:   { bg: "bg-sticker-pink",  text: "text-ink-charcoal" },
  sage:   { bg: "bg-sticker-sage",  text: "text-ink-charcoal" },
  blue:   { bg: "bg-sticker-blue",  text: "text-ink-charcoal" },
  warm:   { bg: "bg-paper-warm",    text: "text-ink-charcoal" },
  orange: { bg: "bg-marker-orange", text: "text-ink-charcoal" },
};

function StickyNoteCard({
  note,
  onRemove,
  onTextChange,
  onCategoryChange,
}: {
  note: StickyNote;
  onRemove: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onCategoryChange?: (id: string, category: "act" | "share" | "let_go") => void;
}) {
  const { bg, text } = COLOR_MAP[note.color];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note.text === "" && textareaRef.current) {
      textareaRef.current.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  return (
    <div
      className={`relative w-36 sm:w-40 ${bg} border-[1.5px] border-ink-charcoal rounded-sm shadow-[3px_3px_0px_#171717] p-3 transition-transform hover:scale-[1.03]`}
      style={{ transform: `rotate(${note.rotate}deg)` }}
    >
      {/* Tape strip */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-4 bg-paper-warm/70 border border-ink-charcoal/30 rounded-[2px] pointer-events-none" />
      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(note.id)}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-ink-charcoal text-paper-base flex items-center justify-center text-[11px] font-bold hover:bg-burnt-orange transition-colors z-10 shadow-[1px_1px_0px_#171717] leading-none"
        aria-label="Hapus catatan"
      >
        x
      </button>
      <textarea
        ref={textareaRef}
        value={note.text}
        onChange={(e) => onTextChange(note.id, e.target.value)}
        placeholder="tulis beban..."
        rows={2}
        className={`w-full resize-none bg-transparent border-0 p-0 font-script text-base ${text} placeholder:text-ink-charcoal/40 focus:outline-none leading-snug`}
      />

      {/* Interactive Category Selector (Act / Share / Let Go) */}
      {onCategoryChange && (
        <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-ink-charcoal/20">
          <button
            type="button"
            onClick={() => onCategoryChange(note.id, "act")}
            className={`text-[9px] font-mono-tag px-1.5 py-0.5 rounded border transition-colors ${
              note.category === "act" || !note.category
                ? "bg-ink-charcoal text-paper-base border-ink-charcoal font-bold"
                : "bg-paper-base/60 text-ink-charcoal/70 border-ink-charcoal/30 hover:bg-paper-base"
            }`}
            title="Bisa Diubah / Aksi"
          >
            Aksi
          </button>
          <button
            type="button"
            onClick={() => onCategoryChange(note.id, "share")}
            className={`text-[9px] font-mono-tag px-1.5 py-0.5 rounded border transition-colors ${
              note.category === "share"
                ? "bg-ink-charcoal text-paper-base border-ink-charcoal font-bold"
                : "bg-paper-base/60 text-ink-charcoal/70 border-ink-charcoal/30 hover:bg-paper-base"
            }`}
            title="Bisa Dibagi / Butuh Teman"
          >
            Bagi
          </button>
          <button
            type="button"
            onClick={() => onCategoryChange(note.id, "let_go")}
            className={`text-[9px] font-mono-tag px-1.5 py-0.5 rounded border transition-colors ${
              note.category === "let_go"
                ? "bg-ink-charcoal text-paper-base border-ink-charcoal font-bold"
                : "bg-paper-base/60 text-ink-charcoal/70 border-ink-charcoal/30 hover:bg-paper-base"
            }`}
            title="Di Luar Kendali / Ikhlaskan"
          >
            Lepas
          </button>
        </div>
      )}
    </div>
  );
}

export function BrainDumpSection() {
  const {
    brainDump,
    setBrainDump,
    addBrainDumpTopic,
    stickyNotes,
    addStickyNote,
    removeStickyNote,
    updateStickyCategory,
  } = useJournalStore();

  const handleStickyText = (id: string, val: string) => {
    useJournalStore.setState((state) => ({
      stickyNotes: state.stickyNotes.map((n) => (n.id === id ? { ...n, text: val } : n)),
    }));
  };

  const leftNotes  = stickyNotes.filter((n) => n.side === "left");
  const rightNotes = stickyNotes.filter((n) => n.side === "right");

  return (
    <div className="min-h-screen flex flex-col bg-paper-warm tactile-dot-grid pb-36 sm:pb-28">
      <Header subtitle="LOAD 01/02" showSteps={true} stepNumber={2} totalSteps={4} />

      <main className="w-full max-w-[1120px] mx-auto px-4 md:px-12 pt-8 md:pt-12 flex-grow">
        {/* Page header */}
        <div className="max-w-3xl mx-auto text-center relative mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="bg-marker-orange text-ink-charcoal font-mono-tag text-xs uppercase px-3 py-1 rounded-full border-[1.5px] border-ink-charcoal shadow-[2px_2px_0px_#171717] -rotate-2 font-bold">
              Tahap 02 - LOAD
            </span>
            <span className="font-script text-lg text-burnt-orange font-bold hidden sm:inline-block">
              (curahkan isi kepalamu)
            </span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold text-ink-charcoal tracking-tight lowercase mb-2">
            tulis semua yang ada di pikiranmu.
          </h1>
          <p className="text-sm md:text-base text-ink-charcoal/80">
            Tidak perlu rapi. Tidak perlu masuk akal. Tulis saja.
          </p>
        </div>

        {/* Topic sticker chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="font-mono-tag text-xs text-ink-charcoal/60 uppercase mr-1">
            Klik untuk tambah topik:
          </span>
          {STICKERS.map((s) => (
            <button
              key={s}
              onClick={() => addBrainDumpTopic(s)}
              type="button"
              className="bg-paper-base hover:bg-marker-orange/20 text-ink-charcoal border-[1.5px] border-ink-charcoal px-3 py-1 rounded-full text-xs font-script font-bold shadow-[1px_1px_0px_#171717] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              # {s}
            </button>
          ))}
        </div>

        {/* Main layout: left sticky | textarea | right sticky */}
        <div className="relative max-w-5xl mx-auto flex items-start gap-4 md:gap-6">

          {/* Left sticky notes */}
          <div className="hidden md:flex flex-col gap-5 pt-10 w-44 shrink-0 items-end">
            {leftNotes.map((note) => (
              <StickyNoteCard
                key={note.id}
                note={note}
                onRemove={removeStickyNote}
                onTextChange={handleStickyText}
                onCategoryChange={updateStickyCategory}
              />
            ))}
          </div>

          {/* Textarea card */}
          <div className="flex-1 relative bg-paper-base border-[1.5px] border-ink-charcoal rounded-xl shadow-[4px_4px_0px_#171717] pt-7 pb-4 px-5 md:px-8">
            <div className="washi-tape absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 rounded-[2px] z-30 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono-tag tracking-widest text-ink-charcoal/50 uppercase font-bold">
                UNMASKED - RAW
              </span>
            </div>

            <div className="flex items-center justify-between border-b-[1.5px] border-ink-charcoal/20 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-marker-orange">edit_note</span>
                <span className="font-mono-tag text-xs text-ink-charcoal/70 uppercase">Lembar Curahan Pikiran</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-script text-base text-burnt-orange font-bold">mode tanpa sensor</span>
                <span className="w-2 h-2 rounded-full bg-marker-orange animate-pulse"></span>
              </div>
            </div>

            <textarea
              className="w-full resize-none border-0 p-2 text-ink-charcoal text-base focus:ring-0 focus:outline-none placeholder:text-ink-charcoal/40 bg-transparent"
              rows={6}
              maxLength={2000}
              placeholder="apa yang sedang memenuhi pikiranmu?"
              value={brainDump}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= 2000) {
                  setBrainDump(val);
                } else {
                  setBrainDump(val.slice(0, 2000));
                }
              }}
            />

            <div className="flex items-center justify-between gap-2 pt-2.5 sm:pt-3 border-t-[1.5px] border-ink-charcoal/15 mt-2 font-mono-tag text-[11px] sm:text-xs text-ink-charcoal/70">
              <button
                type="button"
                onClick={() => addStickyNote("act")}
                className="flex items-center gap-1 text-ink-charcoal hover:text-burnt-orange underline decoration-marker-orange transition-colors shrink-0 font-medium"
              >
                <span className="material-symbols-outlined text-[15px]">add_circle</span>
                <span className="hidden sm:inline">+ Tambah poin beban</span>
                <span className="sm:hidden">+ Poin beban</span>
              </button>
              <div className="flex items-center gap-1.5 shrink-0 text-right">
                {(brainDump || "").length >= 2000 && (
                  <span className="text-[10px] text-burnt-orange font-bold uppercase tracking-wider animate-pulse hidden sm:inline">
                    Maksimal 2000
                  </span>
                )}
                <span>
                  {brainDump.trim() ? brainDump.trim().split(/\s+/).filter(Boolean).length : 0} kata
                </span>
                <span className="text-ink-charcoal/40">·</span>
                <span
                  className={
                    (brainDump || "").length >= 2000
                      ? "text-burnt-orange font-bold"
                      : (brainDump || "").length >= 1800
                      ? "text-amber-800 font-bold"
                      : "text-ink-charcoal/70"
                  }
                >
                  {(brainDump || "").length}/2000 karakter
                </span>
              </div>
            </div>
          </div>

          {/* Right sticky notes */}
          <div className="hidden md:flex flex-col gap-5 pt-10 w-44 shrink-0 items-start">
            {rightNotes.map((note) => (
              <StickyNoteCard
                key={note.id}
                note={note}
                onRemove={removeStickyNote}
                onTextChange={handleStickyText}
                onCategoryChange={updateStickyCategory}
              />
            ))}
          </div>
        </div>

        {/* Mobile: sticky notes below textarea */}
        {stickyNotes.length > 0 && (
          <div className="md:hidden flex flex-wrap gap-4 justify-center mt-6 px-2">
            {stickyNotes.map((note) => (
              <StickyNoteCard
                key={note.id}
                note={note}
                onRemove={removeStickyNote}
                onTextChange={handleStickyText}
                onCategoryChange={updateStickyCategory}
              />
            ))}
          </div>
        )}
      </main>

      <BottomDock
        backTo="/mask-result"
        nextTo="/story-reflection"
        nextLabel="Analisis Beban"
        centerLabel="LOAD: Curahan Pikiran"
      />
    </div>
  );
}
