"use client";

import { create } from "zustand";

export type StickyColor = "pink" | "sage" | "blue" | "warm" | "orange";

export interface StickyNote {
  id: string;
  text: string;
  color: StickyColor;
  rotate: number; // degrees, -8 to 8
  side: "left" | "right";
  order: number; // position index on that side
}

export interface JournalState {
  publicTags: string[];
  actualFeelings: string[];
  feelingNote: string;
  brainDump: string;
  stickyNotes: StickyNote[];
  restRating: number;
  selectedAction: string;
  bookmarked: boolean;

  togglePublicTag: (tag: string) => void;
  addCustomPublicTag: (tag: string) => void;
  toggleActualFeeling: (feeling: string) => void;
  setFeelingNote: (note: string) => void;
  setBrainDump: (text: string) => void;
  addBrainDumpTopic: (topic: string) => void;
  addStickyNote: () => void;
  removeStickyNote: (id: string) => void;
  setRestRating: (rating: number) => void;
  setSelectedAction: (action: string) => void;
  toggleBookmarked: () => void;
  resetSession: () => void;
}

const STICKY_COLORS: StickyColor[] = ["pink", "sage", "blue", "warm", "orange"];
const TOPIC_COLORS: Record<string, StickyColor> = {
  kuliah: "blue",
  hubungan: "pink",
  uang: "warm",
  ekspektasi: "orange",
  "masa depan": "sage",
  "takut gagal": "pink",
};

function randomRotate() {
  return Math.round((Math.random() * 14 - 7) * 10) / 10;
}

const initialValues = {
  publicTags: ["Produktif", "Kuat"],
  actualFeelings: ["Lelah", "Kewalahan"],
  feelingNote: "",
  brainDump:
    "banyak tenggat waktu kuliah minggu ini, rasanya harus selalu kelihatan baik-baik saja di depan teman kelompok, padahal energi lagi tiris banget...",
  stickyNotes: [] as StickyNote[],
  restRating: 2,
  selectedAction:
    "Pilih satu tugas yang harus diselesaikan malam ini dan izinkan dirimu untuk melanjutkannya besok.",
  bookmarked: false,
};

export const useJournalStore = create<JournalState>((set) => ({
  ...initialValues,

  togglePublicTag: (tag) =>
    set((state) => ({
      publicTags: state.publicTags.includes(tag)
        ? state.publicTags.filter((t) => t !== tag)
        : [...state.publicTags, tag],
    })),

  addCustomPublicTag: (tag) =>
    set((state) => {
      const trimmed = tag.trim();
      if (!trimmed || state.publicTags.includes(trimmed)) return state;
      return { publicTags: [...state.publicTags, trimmed] };
    }),

  toggleActualFeeling: (feeling) =>
    set((state) => ({
      actualFeelings: state.actualFeelings.includes(feeling)
        ? state.actualFeelings.filter((f) => f !== feeling)
        : [...state.actualFeelings, feeling],
    })),

  setFeelingNote: (note) => set({ feelingNote: note }),

  setBrainDump: (text) => set({ brainDump: text }),

  addBrainDumpTopic: (topic) =>
    set((state) => {
      const leftCount = state.stickyNotes.filter((n) => n.side === "left").length;
      const rightCount = state.stickyNotes.filter((n) => n.side === "right").length;
      const side: "left" | "right" = leftCount <= rightCount ? "left" : "right";
      const order = side === "left" ? leftCount : rightCount;
      const color: StickyColor = TOPIC_COLORS[topic] ?? STICKY_COLORS[order % STICKY_COLORS.length];
      const newNote: StickyNote = {
        id: Date.now().toString(),
        text: `#${topic}`,
        color,
        rotate: randomRotate(),
        side,
        order,
      };
      return { stickyNotes: [...state.stickyNotes, newNote] };
    }),

  addStickyNote: () =>
    set((state) => {
      const leftCount = state.stickyNotes.filter((n) => n.side === "left").length;
      const rightCount = state.stickyNotes.filter((n) => n.side === "right").length;
      const side: "left" | "right" = leftCount <= rightCount ? "left" : "right";
      const order = side === "left" ? leftCount : rightCount;
      const colorIdx = state.stickyNotes.length % STICKY_COLORS.length;
      const newNote: StickyNote = {
        id: Date.now().toString(),
        text: "",
        color: STICKY_COLORS[colorIdx],
        rotate: randomRotate(),
        side,
        order,
      };
      return { stickyNotes: [...state.stickyNotes, newNote] };
    }),

  removeStickyNote: (id) =>
    set((state) => ({
      stickyNotes: state.stickyNotes.filter((n) => n.id !== id),
    })),

  setRestRating: (rating) => set({ restRating: rating }),

  setSelectedAction: (action) => set({ selectedAction: action }),

  toggleBookmarked: () => set((state) => ({ bookmarked: !state.bookmarked })),

  resetSession: () => set(initialValues),
}));
