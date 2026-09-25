"use client";

import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  MaskInsight,
  LoadInsight,
  NeedInsight,
  NeedQuestion,
  NeedAnswer,
  CandidateNeed,
  ActionRecommendation,
  SummaryStage,
  UserConfirmation,
  LoadItem,
} from "@/types/session";

export type StickyColor = "pink" | "sage" | "blue" | "warm" | "orange";

export interface StickyNote {
  id: string;
  text: string;
  color: StickyColor;
  rotate: number;
  side: "left" | "right";
  order: number;
  category?: "act" | "share" | "let_go";
}

export interface JournalState {
  // Session ID & Meta
  sessionId: string;

  // Stage 1: MASK
  publicTags: string[];
  actualFeelings: string[];
  feelingNote: string;
  maskInsight: MaskInsight | null;
  maskConfirmation: UserConfirmation | null;

  // Stage 2: LOAD
  brainDump: string;
  stickyNotes: StickyNote[];
  loadItems: LoadItem[];
  loadInsight: LoadInsight | null;
  loadConfirmation: UserConfirmation | null;

  // Stage 3: NEED
  needCandidates: CandidateNeed[];
  needQuestions: NeedQuestion[];
  needAnswers: NeedAnswer[];
  needInsight: NeedInsight | null;
  needConfirmation: UserConfirmation | null;

  // Stage 4: ACTION
  actionRecommendations: ActionRecommendation[];
  selectedAction: string;
  selectedActionId: string;
  actionCompleted: boolean;

  // Stage 5: SUMMARY
  summaryData: SummaryStage | null;
  bookmarked: boolean;

  // Hydration status
  hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;

  // Loading & Error States
  loadingState: {
    mask: boolean;
    load: boolean;
    needPrepare: boolean;
    needSynthesize: boolean;
    action: boolean;
    summary: boolean;
  };
  errorState: {
    mask: string | null;
    load: string | null;
    need: string | null;
    action: string | null;
    summary: string | null;
  };

  // Actions
  togglePublicTag: (tag: string) => void;
  addCustomPublicTag: (tag: string) => void;
  toggleActualFeeling: (feeling: string) => void;
  setFeelingNote: (note: string) => void;
  setMaskInsight: (insight: MaskInsight | null) => void;
  setMaskConfirmation: (conf: UserConfirmation) => void;

  setBrainDump: (text: string) => void;
  addBrainDumpTopic: (topic: string) => void;
  addStickyNote: (category?: "act" | "share" | "let_go") => void;
  updateStickyCategory: (id: string, category: "act" | "share" | "let_go") => void;
  updateStickyText: (id: string, text: string) => void;
  removeStickyNote: (id: string) => void;
  setLoadInsight: (insight: LoadInsight | null) => void;
  setLoadConfirmation: (conf: UserConfirmation) => void;

  setNeedCandidatesAndQuestions: (candidates: CandidateNeed[], questions: NeedQuestion[]) => void;
  setNeedAnswer: (questionId: string, answer: string) => void;
  setNeedInsight: (insight: NeedInsight | null) => void;
  setNeedConfirmation: (conf: UserConfirmation) => void;

  setActionRecommendations: (recs: ActionRecommendation[]) => void;
  setSelectedAction: (actionText: string, actionId?: string) => void;
  toggleActionCompleted: () => void;

  setSummaryData: (summary: SummaryStage | null) => void;
  toggleBookmarked: () => void;
  setLoading: (stage: keyof JournalState["loadingState"], isLoading: boolean) => void;
  setError: (stage: keyof JournalState["errorState"], error: string | null) => void;
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

function generateSessionId() {
  return "session-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
}

const initialValues = {
  hasHydrated: false,
  sessionId: generateSessionId(),
  publicTags: ["Produktif", "Kuat"],
  actualFeelings: ["Lelah", "Kewalahan"],
  feelingNote: "",
  maskInsight: null as MaskInsight | null,
  maskConfirmation: null as UserConfirmation | null,

  brainDump: "Banyak tenggat waktu kuliah minggu ini, rasanya harus selalu kelihatan baik-baik saja di depan teman kelompok, padahal energi lagi tiris banget...",
  stickyNotes: [] as StickyNote[],
  loadItems: [] as LoadItem[],
  loadInsight: null as LoadInsight | null,
  loadConfirmation: null as UserConfirmation | null,

  needCandidates: [] as CandidateNeed[],
  needQuestions: [] as NeedQuestion[],
  needAnswers: [] as NeedAnswer[],
  needInsight: null as NeedInsight | null,
  needConfirmation: null as UserConfirmation | null,

  actionRecommendations: [] as ActionRecommendation[],
  selectedAction: "",
  selectedActionId: "",
  actionCompleted: false,

  summaryData: null as SummaryStage | null,
  bookmarked: false,

  loadingState: {
    mask: false,
    load: false,
    needPrepare: false,
    needSynthesize: false,
    action: false,
    summary: false,
  },
  errorState: {
    mask: null,
    load: null,
    need: null,
    action: null,
    summary: null,
  },
};

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      ...initialValues,

      setHasHydrated: (val) => set({ hasHydrated: val }),

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
      setMaskInsight: (insight) => set({ maskInsight: insight }),
      setMaskConfirmation: (conf) => set({ maskConfirmation: conf }),

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
            category: "act",
          };
          return { stickyNotes: [...state.stickyNotes, newNote] };
        }),

      addStickyNote: (category = "act") =>
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
            category,
          };
          return { stickyNotes: [...state.stickyNotes, newNote] };
        }),

      updateStickyCategory: (id, category) =>
        set((state) => ({
          stickyNotes: state.stickyNotes.map((n) =>
            n.id === id ? { ...n, category } : n
          ),
        })),

      updateStickyText: (id, text) =>
        set((state) => ({
          stickyNotes: state.stickyNotes.map((n) =>
            n.id === id ? { ...n, text } : n
          ),
        })),

      removeStickyNote: (id) =>
        set((state) => ({
          stickyNotes: state.stickyNotes.filter((n) => n.id !== id),
        })),

      setLoadInsight: (insight) => set({ loadInsight: insight }),
      setLoadConfirmation: (conf) => set({ loadConfirmation: conf }),

      setNeedCandidatesAndQuestions: (candidates, questions) =>
        set({ needCandidates: candidates, needQuestions: questions }),

      setNeedAnswer: (questionId, answer) =>
        set((state) => {
          const filtered = state.needAnswers.filter((a) => a.questionId !== questionId);
          return { needAnswers: [...filtered, { questionId, answer }] };
        }),

      setNeedInsight: (insight) => set({ needInsight: insight }),
      setNeedConfirmation: (conf) => set({ needConfirmation: conf }),

      setActionRecommendations: (recs) => set({ actionRecommendations: recs }),
      setSelectedAction: (actionText, actionId = "action-primary") =>
        set({ selectedAction: actionText, selectedActionId: actionId }),
      toggleActionCompleted: () =>
        set((state) => ({ actionCompleted: !state.actionCompleted })),

      setSummaryData: (summary) => set({ summaryData: summary }),
      toggleBookmarked: () => set((state) => ({ bookmarked: !state.bookmarked })),

      setLoading: (stage, isLoading) =>
        set((state) => ({
          loadingState: { ...state.loadingState, [stage]: isLoading },
        })),

      setError: (stage, error) =>
        set((state) => ({
          errorState: { ...state.errorState, [stage]: error },
        })),

      resetSession: () =>
        set({
          ...initialValues,
          sessionId: generateSessionId(),
        }),
    }),
    {
      name: "unmasked-session-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        sessionId: state.sessionId,
        publicTags: state.publicTags,
        actualFeelings: state.actualFeelings,
        feelingNote: state.feelingNote,
        maskInsight: state.maskInsight,
        maskConfirmation: state.maskConfirmation,
        brainDump: state.brainDump,
        stickyNotes: state.stickyNotes,
        loadInsight: state.loadInsight,
        loadConfirmation: state.loadConfirmation,
        needCandidates: state.needCandidates,
        needQuestions: state.needQuestions,
        needAnswers: state.needAnswers,
        needInsight: state.needInsight,
        needConfirmation: state.needConfirmation,
        actionRecommendations: state.actionRecommendations,
        selectedAction: state.selectedAction,
        selectedActionId: state.selectedActionId,
        actionCompleted: state.actionCompleted,
        summaryData: state.summaryData,
        bookmarked: state.bookmarked,
      }),
    }
  )
);

/**
 * Custom hook to safely determine whether the persistent Zustand store
 * has completed rehydration from localStorage.
 * This prevents firing duplicate AI fetches on mount before saved data is restored.
 */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  const storeHydrated = useJournalStore((state) => state.hasHydrated);

  useEffect(() => {
    if (storeHydrated || useJournalStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useJournalStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return () => {
      unsub();
    };
  }, [storeHydrated]);

  return hydrated;
}

