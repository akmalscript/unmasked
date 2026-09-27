import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

const fallbackStorage: StateStorage = {
  getItem: (key: string) => {
    if (typeof localStorage !== "undefined") return localStorage.getItem(key);
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  },
};
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

  // Stage 4: ACTION (Strictly user-selected)
  actionRecommendations: ActionRecommendation[];
  selectedAction: string | null;
  selectedActionId: string | null;
  actionCompleted: boolean;

  // Stage 5: SUMMARY
  summaryData: SummaryStage | null;
  bookmarked: boolean;

  // Session activity & shared device protection (2 hours inactivity)
  lastActiveTimestamp: number;
  touchActivity: () => void;

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
  addCustomActualFeeling: (feeling: string) => void;
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
  setSelectedAction: (actionText: string | null, actionId?: string | null) => void;
  toggleActionCompleted: () => void;

  setSummaryData: (summary: SummaryStage | null) => void;
  toggleBookmarked: () => void;
  setLoading: (stage: keyof JournalState["loadingState"], isLoading: boolean) => void;
  setError: (stage: keyof JournalState["errorState"], error: string | null) => void;
  resetSession: () => void;
  clearAllData: () => void;
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
  lastActiveTimestamp: Date.now(),
  sessionId: generateSessionId(),
  publicTags: [] as string[],
  actualFeelings: [] as string[],
  feelingNote: "",
  maskInsight: null as MaskInsight | null,
  maskConfirmation: null as UserConfirmation | null,

  brainDump: "",
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
  selectedAction: null as string | null,
  selectedActionId: null as string | null,
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

      touchActivity: () => set({ lastActiveTimestamp: Date.now() }),

      togglePublicTag: (tag) =>
        set((state) => ({
          lastActiveTimestamp: Date.now(),
          publicTags: state.publicTags.includes(tag)
            ? state.publicTags.filter((t) => t !== tag)
            : [...state.publicTags, tag],
        })),

      addCustomPublicTag: (tag) =>
        set((state) => {
          const trimmed = tag.trim();
          if (!trimmed || state.publicTags.includes(trimmed)) return state;
          return {
            lastActiveTimestamp: Date.now(),
            publicTags: [...state.publicTags, trimmed],
          };
        }),

      toggleActualFeeling: (feeling) =>
        set((state) => ({
          lastActiveTimestamp: Date.now(),
          actualFeelings: state.actualFeelings.includes(feeling)
            ? state.actualFeelings.filter((f) => f !== feeling)
            : [...state.actualFeelings, feeling],
        })),

      addCustomActualFeeling: (feeling) =>
        set((state) => {
          const trimmed = feeling.trim();
          if (!trimmed || state.actualFeelings.includes(trimmed)) return state;
          return {
            lastActiveTimestamp: Date.now(),
            actualFeelings: [...state.actualFeelings, trimmed],
          };
        }),

      setFeelingNote: (note) =>
        set({
          feelingNote: note,
          lastActiveTimestamp: Date.now(),
        }),

      setMaskInsight: (insight) =>
        set({
          maskInsight: insight,
          lastActiveTimestamp: Date.now(),
        }),

      setMaskConfirmation: (conf) =>
        set({
          maskConfirmation: conf,
          lastActiveTimestamp: Date.now(),
        }),

      setBrainDump: (text) =>
        set({
          brainDump: text.slice(0, 2000),
          lastActiveTimestamp: Date.now(),
        }),

      addBrainDumpTopic: (topic) =>
        set((state) => {
          const topicText = `#${topic}`;
          if (state.stickyNotes.some((n) => n.text === topicText)) {
            return state;
          }
          const leftCount = state.stickyNotes.filter((n) => n.side === "left").length;
          const rightCount = state.stickyNotes.filter((n) => n.side === "right").length;
          const side: "left" | "right" = leftCount <= rightCount ? "left" : "right";
          const order = side === "left" ? leftCount : rightCount;
          const color: StickyColor = TOPIC_COLORS[topic] ?? STICKY_COLORS[order % STICKY_COLORS.length];
          const newNote: StickyNote = {
            id: Date.now().toString(),
            text: topicText,
            color,
            rotate: randomRotate(),
            side,
            order,
            category: "act",
          };
          return {
            lastActiveTimestamp: Date.now(),
            stickyNotes: [...state.stickyNotes, newNote],
          };
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
          return {
            lastActiveTimestamp: Date.now(),
            stickyNotes: [...state.stickyNotes, newNote],
          };
        }),

      updateStickyCategory: (id, category) =>
        set((state) => ({
          lastActiveTimestamp: Date.now(),
          stickyNotes: state.stickyNotes.map((n) =>
            n.id === id ? { ...n, category } : n
          ),
        })),

      updateStickyText: (id, text) =>
        set((state) => ({
          lastActiveTimestamp: Date.now(),
          stickyNotes: state.stickyNotes.map((n) =>
            n.id === id ? { ...n, text } : n
          ),
        })),

      removeStickyNote: (id) =>
        set((state) => ({
          lastActiveTimestamp: Date.now(),
          stickyNotes: state.stickyNotes.filter((n) => n.id !== id),
        })),

      setLoadInsight: (insight) =>
        set({
          loadInsight: insight,
          lastActiveTimestamp: Date.now(),
        }),

      setLoadConfirmation: (conf) =>
        set({
          loadConfirmation: conf,
          lastActiveTimestamp: Date.now(),
        }),

      setNeedCandidatesAndQuestions: (candidates, questions) =>
        set({
          needCandidates: candidates,
          needQuestions: questions,
          lastActiveTimestamp: Date.now(),
        }),

      setNeedAnswer: (questionId, answer) =>
        set((state) => {
          const filtered = state.needAnswers.filter((a) => a.questionId !== questionId);
          return {
            lastActiveTimestamp: Date.now(),
            needAnswers: [...filtered, { questionId, answer }],
          };
        }),

      setNeedInsight: (insight) =>
        set({
          needInsight: insight,
          lastActiveTimestamp: Date.now(),
        }),

      setNeedConfirmation: (conf) =>
        set({
          needConfirmation: conf,
          lastActiveTimestamp: Date.now(),
        }),

      setActionRecommendations: (recs) =>
        set({
          actionRecommendations: recs,
          lastActiveTimestamp: Date.now(),
        }),

      setSelectedAction: (actionText, actionId = null) =>
        set({
          selectedAction: actionText,
          selectedActionId: actionId,
          lastActiveTimestamp: Date.now(),
        }),

      toggleActionCompleted: () =>
        set((state) => ({
          actionCompleted: !state.actionCompleted,
          lastActiveTimestamp: Date.now(),
        })),

      setSummaryData: (summary) =>
        set({
          summaryData: summary,
          lastActiveTimestamp: Date.now(),
        }),

      toggleBookmarked: () =>
        set((state) => ({
          bookmarked: !state.bookmarked,
          lastActiveTimestamp: Date.now(),
        })),

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
          lastActiveTimestamp: Date.now(),
          hasHydrated: true,
        }),

      clearAllData: () => {
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("unmasked-session-store");
          }
        } catch (e) {
          console.warn("Failed to clear localStorage:", e);
        }
        set({
          ...initialValues,
          sessionId: generateSessionId(),
          lastActiveTimestamp: Date.now(),
          hasHydrated: true,
        });
      },
    }),
    {
      name: "unmasked-session-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" && window.localStorage
          ? window.localStorage
          : fallbackStorage
      ),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Shared device protection: if the last activity was > 2 hours ago, auto-reset session
        if (state && state.lastActiveTimestamp) {
          const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
          if (Date.now() - state.lastActiveTimestamp > TWO_HOURS_MS) {
            console.info("Session expired due to inactivity (>2 hours). Resetting for privacy.");
            state.resetSession();
          }
        }
      },
      partialize: (state) => ({
        sessionId: state.sessionId,
        lastActiveTimestamp: state.lastActiveTimestamp,
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
 */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (useJournalStore.persist.hasHydrated()) {
        return () => {};
      }
      return useJournalStore.persist.onFinishHydration(callback);
    },
    () => useJournalStore.persist.hasHydrated(),
    () => false
  );
}

// ========================================================
// USER CONFIRMATION AS SOURCE OF TRUTH (Prioritas 3 Helpers)
// ========================================================

/**
 * Mengambil interpretasi NEED yang telah dikonfirmasi pengguna.
 * Jika pengguna menolak ("rejected") atau memberikan koreksi,
 * maka koreksi pengguna menjadi sumber kebenaran (source of truth).
 */
export function getConfirmedNeed(state: Pick<JournalState, "needInsight" | "needConfirmation">) {
  if (!state.needInsight?.primaryNeed) return null;

  const rawPrimary = state.needInsight.primaryNeed;
  const conf = state.needConfirmation;

  if (conf?.status === "rejected" || (conf?.correction && conf.correction.trim().length > 0)) {
    const correctionText = conf.correction?.trim() || "Koreksi Kebutuhan Pengguna";
    return {
      key: rawPrimary.key,
      title: correctionText,
      reason: `Disesuaikan berdasarkan konfirmasi pengguna: "${correctionText}"`,
      relevance: "high" as const,
      isUserCorrected: true,
    };
  }

  return {
    ...rawPrimary,
    isUserCorrected: false,
  };
}

/**
 * Mengambil interpretasi LOAD yang telah dikonfirmasi pengguna.
 */
export function getConfirmedLoadSummary(state: Pick<JournalState, "loadInsight" | "loadConfirmation" | "brainDump">): string {
  const conf = state.loadConfirmation;
  if (conf?.status === "rejected" || (conf?.correction && conf.correction.trim().length > 0)) {
    return conf.correction?.trim() || state.loadInsight?.summary || state.brainDump.trim();
  }
  return state.loadInsight?.summary || state.brainDump.trim();
}

/**
 * Mengambil interpretasi MASK yang telah dikonfirmasi pengguna.
 */
export function getConfirmedMaskReflection(state: Pick<JournalState, "maskInsight" | "maskConfirmation">): string {
  const conf = state.maskConfirmation;
  if (conf?.status === "rejected" || (conf?.correction && conf.correction.trim().length > 0)) {
    return conf.correction?.trim() || state.maskInsight?.reflection || "";
  }
  return state.maskInsight?.reflection || "";
}

// ========================================================
// STAGE PREREQUISITE VALIDATORS (Prioritas 1 & 14)
// ========================================================

export function isMaskCompleted(state: Pick<JournalState, "publicTags" | "actualFeelings" | "maskInsight">): boolean {
  return state.publicTags.length > 0 && state.actualFeelings.length > 0 && Boolean(state.maskInsight);
}

export function isLoadCompleted(state: Pick<JournalState, "brainDump" | "stickyNotes" | "loadInsight">): boolean {
  const hasInput = state.brainDump.trim().length > 0 || state.stickyNotes.some((n) => n.text.trim().length > 0);
  return hasInput && Boolean(state.loadInsight);
}

export function isNeedCompleted(state: Pick<JournalState, "needQuestions" | "needAnswers" | "needInsight">): boolean {
  const hasAnswers = state.needAnswers.length > 0 && state.needAnswers.every((a) => a.answer.trim().length > 0);
  return hasAnswers && Boolean(state.needInsight);
}

export function isActionSelected(state: Pick<JournalState, "selectedAction">): boolean {
  return typeof state.selectedAction === "string" && state.selectedAction.trim().length > 0;
}

export function canProceedToSummary(
  state: Parameters<typeof isMaskCompleted>[0] &
    Parameters<typeof isLoadCompleted>[0] &
    Parameters<typeof isNeedCompleted>[0] &
    Parameters<typeof isActionSelected>[0]
): boolean {
  return (
    isMaskCompleted(state) &&
    isLoadCompleted(state) &&
    isNeedCompleted(state) &&
    isActionSelected(state)
  );
}
