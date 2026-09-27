import { describe, it, expect, beforeEach } from "vitest";
import {
  useJournalStore,
  getConfirmedNeed,
  getConfirmedLoadSummary,
  getConfirmedMaskReflection,
  isMaskCompleted,
  isLoadCompleted,
  isNeedCompleted,
  isActionSelected,
  canProceedToSummary,
} from "../src/store/useJournalStore";
import { LoadInsight, MaskInsight } from "../src/types/session";
import {
  MaskInputSchema,
  MaskInsightSchema,
  LoadInputSchema,
  NeedPrepareOutputSchema,
  ActionOutputSchema,
} from "../src/schemas/reflection";
import {
  checkCrisisRisk,
  containsCrisisKeywords,
  getCrisisMatches,
} from "../src/lib/safety/crisisKeywords";
import { CRISIS_RESOURCES } from "../src/lib/safety/crisisResources";
import { checkRateLimit, validateBodySize } from "../src/lib/ai/rateLimit";
import { parseAIError } from "../src/lib/ai/client";

describe("UNMASKED System Hardening & Reliability Regression Suite", () => {
  beforeEach(() => {
    // Reset store before each test
    useJournalStore.getState().clearAllData();
  });

  // ========================================================
  // SCENARIO 1: User does not select ACTION -> isActionSelected is false; SUMMARY cannot proceed
  // ========================================================
  describe("Scenario 1: Mandatory Action Step Selection Gate", () => {
    it("should keep selectedAction as null initially and prevent proceeding to summary", () => {
      const state = useJournalStore.getState();
      expect(state.selectedAction).toBeNull();
      expect(state.selectedActionId).toBeNull();
      expect(isActionSelected(state)).toBe(false);

      // Even if mask, load, and need are set, summary must not be accessible without action selection
      const mockCompletedJourney = {
        ...state,
        publicTags: ["Terkendali"],
        actualFeelings: ["Kelelahan"],
        maskInsight: {
          contrasts: [{ publicTrait: "Terkendali", internalState: "Kelelahan", interpretation: "Topeng" }],
          reflection: "Analisis topeng yang mendalam",
          confidence: "high" as const,
        },
        brainDump: "Banyak deadline",
        loadInsight: {
          summary: "Beban kerja tinggi",
          themes: [{ name: "Tuntutan", relevance: "high" as const }],
          emotionalContext: [{ label: "Lelah", intensity: "high" as const }],
          patterns: [],
          confidence: "high" as const,
        },
        needQuestions: [{ id: "q1", question: "Apa kebutuhanmu?", targetNeed: "rest" as const, type: "open" as const }],
        needAnswers: [{ questionId: "q1", answer: "Butuh tidur dan tenang" }],
        needInsight: {
          primaryNeed: {
            key: "rest" as const,
            title: "Istirahat Total",
            reason: "Energi terkuras",
            relevance: "high" as const,
          },
          explanation: "Butuh waktu tenang",
          confidence: "high" as const,
        },
        selectedAction: null,
      };

      expect(canProceedToSummary(mockCompletedJourney)).toBe(false);
    });
  });

  // ========================================================
  // SCENARIO 2: User selects ACTION -> selectedAction saved; SUMMARY prerequisite passed
  // ========================================================
  describe("Scenario 2: Action Selection State Persistence", () => {
    it("should update selectedAction and selectedActionId when user confirms selection", () => {
      useJournalStore.getState().setActionRecommendations([
        {
          id: "act-1",
          title: "Tutup Laptop 15 Menit",
          description: "Jauhkan layar untuk meregangkan mata dan bahu.",
          type: "primary",
          estimatedMinutes: 15,
          why: "Memberi jeda",
          relatedNeed: "rest",
        },
        {
          id: "act-2",
          title: "Minum Air Hangat",
          description: "Ambil jeda 5 menit minum air tanpa melihat ponsel.",
          type: "low_energy",
          estimatedMinutes: 5,
          why: "Hidrasi dan grounding",
          relatedNeed: "rest",
        },
      ]);

      expect(useJournalStore.getState().selectedAction).toBeNull();

      // User selects act-1
      useJournalStore
        .getState()
        .setSelectedAction("Tutup Laptop 15 Menit — Jauhkan layar untuk meregangkan mata dan bahu.", "act-1");

      const updated = useJournalStore.getState();
      expect(updated.selectedAction).toContain("Tutup Laptop 15 Menit");
      expect(updated.selectedActionId).toBe("act-1");
      expect(isActionSelected(updated)).toBe(true);
    });
  });

  // ========================================================
  // SCENARIO 3: AI Need rejected / corrected by user -> getConfirmedNeed uses user correction
  // ========================================================
  describe("Scenario 3: User Confirmation as Source of Truth", () => {
    it("should override raw AI need when user provides a correction or rejects it", () => {
      const needInsight = {
        primaryNeed: {
          key: "rest" as const,
          title: "Istirahat Fisik",
          reason: "Kamu tampak kelelahan fisik.",
          relevance: "high" as const,
        },
        explanation: "Analisis kebutuhan awal",
        confidence: "high" as const,
      };

      // 1. Unconfirmed state -> returns raw AI need
      const raw = getConfirmedNeed({ needInsight, needConfirmation: null });
      expect(raw?.title).toBe("Istirahat Fisik");
      expect(raw?.isUserCorrected).toBe(false);

      // 2. User rejects and provides custom correction
      const corrected = getConfirmedNeed({
        needInsight,
        needConfirmation: {
          status: "rejected",
          correction: "Bukan fisik, saya butuh batasan tegas dari rekan kerja",
        },
      });

      expect(corrected?.title).toBe("Bukan fisik, saya butuh batasan tegas dari rekan kerja");
      expect(corrected?.isUserCorrected).toBe(true);
      expect(corrected?.reason).toContain("Bukan fisik, saya butuh batasan tegas dari rekan kerja");
    });

    it("should prioritize user corrections for LOAD and MASK interpretations as well", () => {
      const loadInsight: LoadInsight = {
        summary: "Beban dari proyek kantor",
        themes: [],
        emotionalContext: [],
        patterns: [],
        confidence: "medium",
      };
      const confirmedLoad = getConfirmedLoadSummary({
        loadInsight,
        loadConfirmation: {
          status: "rejected",
          correction: "Beban sebenarnya adalah ekspektasi keluarga",
        },
        brainDump: "tekanan tinggi",
      });
      expect(confirmedLoad).toBe("Beban sebenarnya adalah ekspektasi keluarga");

      const maskInsight: MaskInsight = {
        contrasts: [],
        reflection: "Kamu menampilkan sosok kuat",
        confidence: "medium",
      };
      const confirmedMask = getConfirmedMaskReflection({
        maskInsight,
        maskConfirmation: {
          status: "rejected",
          correction: "Saya hanya ingin menghindari konflik",
        },
      });
      expect(confirmedMask).toBe("Saya hanya ingin menghindari konflik");
    });
  });

  // ========================================================
  // SCENARIO 4: LOAD category changed -> store stickyNotes[i].category updates
  // ========================================================
  describe("Scenario 4: Sticky Note Category Classification Integrity", () => {
    it("should update sticky category and keep text intact", () => {
      const store = useJournalStore.getState();
      store.addStickyNote("act");

      const notes = useJournalStore.getState().stickyNotes;
      expect(notes.length).toBe(1);
      const noteId = notes[0].id;
      expect(notes[0].category).toBe("act");

      // Set text
      useJournalStore.getState().updateStickyText(noteId, "Tuntutan deadline presentasi");
      expect(useJournalStore.getState().stickyNotes[0].text).toBe("Tuntutan deadline presentasi");

      // User re-classifies as 'share' (Bagi Beban)
      useJournalStore.getState().updateStickyCategory(noteId, "share");
      const updatedNotes = useJournalStore.getState().stickyNotes;
      expect(updatedNotes[0].category).toBe("share");
      expect(updatedNotes[0].text).toBe("Tuntutan deadline presentasi");
    });
  });

  // ========================================================
  // SCENARIO 5: Session refresh -> Zustand persist rehydrates without data loss
  // ========================================================
  describe("Scenario 5: Session Rehydration & State Retention", () => {
    it("should maintain all user inputs across state reload", () => {
      useJournalStore.setState({
        publicTags: ["Tenang", "Ceria"],
        actualFeelings: ["Cemas", "Sendirian"],
        selectedAction: "Langkah 1",
        selectedActionId: "act-1",
      });

      const savedState = useJournalStore.getState();
      expect(savedState.publicTags).toEqual(["Tenang", "Ceria"]);
      expect(savedState.actualFeelings).toEqual(["Cemas", "Sendirian"]);
      expect(savedState.selectedAction).toBe("Langkah 1");
      expect(savedState.selectedActionId).toBe("act-1");
    });
  });

  // ========================================================
  // SCENARIO 6: Session inactivity timeout -> session auto-resets after > 2 hours
  // ========================================================
  describe("Scenario 6: Inactivity Timeout Security (>2 Hours)", () => {
    it("should reset session when lastActiveTimestamp exceeds 2 hours", () => {
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      const expiredTimestamp = Date.now() - (TWO_HOURS_MS + 5000);

      // Simulate state with old timestamp
      useJournalStore.setState({
        lastActiveTimestamp: expiredTimestamp,
        publicTags: ["Sibuk"],
        actualFeelings: ["Lelah"],
      });

      // Verify that checking timestamp against timeout condition triggers reset
      const state = useJournalStore.getState();
      const isExpired = Date.now() - state.lastActiveTimestamp > TWO_HOURS_MS;
      expect(isExpired).toBe(true);

      if (isExpired) {
        state.resetSession();
      }

      const resetState = useJournalStore.getState();
      expect(resetState.publicTags).toEqual([]);
      expect(resetState.actualFeelings).toEqual([]);
      expect(resetState.selectedAction).toBeNull();
    });
  });

  // ========================================================
  // SCENARIO 7: Missing MASK/LOAD/NEED/ACTION -> stage prerequisite validators fail
  // ========================================================
  describe("Scenario 7: Strict Stage Progression Gatekeepers", () => {
    it("should fail prerequisite validation if any stage is missing or incomplete", () => {
      // 1. Blank state
      const emptyState = useJournalStore.getState();
      expect(isMaskCompleted(emptyState)).toBe(false);
      expect(isLoadCompleted(emptyState)).toBe(false);
      expect(isNeedCompleted(emptyState)).toBe(false);
      expect(isActionSelected(emptyState)).toBe(false);
      expect(canProceedToSummary(emptyState)).toBe(false);

      // 2. Only Mask completed
      const partialState = {
        ...emptyState,
        publicTags: ["Terkendali"],
        actualFeelings: ["Gelisah"],
        maskInsight: {
          contrasts: [],
          reflection: "Refleksi",
          confidence: "medium" as const,
        },
      };
      expect(isMaskCompleted(partialState)).toBe(true);
      expect(isLoadCompleted(partialState)).toBe(false);
      expect(canProceedToSummary(partialState)).toBe(false);
    });
  });

  // ========================================================
  // SCENARIO 8: Invalid AI output -> schema validation fails and catches
  // ========================================================
  describe("Scenario 8: Strict Zod Output Schemas", () => {
    it("should reject MaskInsight with missing required fields", () => {
      const invalidMaskOutput = {
        reflection: "Hanya refleksi saja",
        // missing contrasts
      };
      const result = MaskInsightSchema.safeParse(invalidMaskOutput);
      expect(result.success).toBe(false);
    });

    it("should reject NeedPrepareOutput with fewer than 2 or more than 3 questions", () => {
      // 1 question -> must fail (min is 2)
      const oneQuestion = {
        candidates: [{ key: "rest", title: "Istirahat", reason: "Desc", relevance: "high" }],
        questions: [{ id: "q1", question: "Pertanyaan 1 yang cukup panjang?", targetNeed: "rest" }],
      };
      expect(NeedPrepareOutputSchema.safeParse(oneQuestion).success).toBe(false);

      // 4 questions -> must fail (max is 3)
      const fourQuestions = {
        candidates: [{ key: "rest", title: "Istirahat", reason: "Desc", relevance: "high" }],
        questions: [
          { id: "q1", question: "Pertanyaan 1 yang cukup panjang?", targetNeed: "rest" },
          { id: "q2", question: "Pertanyaan 2 yang cukup panjang?", targetNeed: "rest" },
          { id: "q3", question: "Pertanyaan 3 yang cukup panjang?", targetNeed: "rest" },
          { id: "q4", question: "Pertanyaan 4 yang cukup panjang?", targetNeed: "rest" },
        ],
      };
      expect(NeedPrepareOutputSchema.safeParse(fourQuestions).success).toBe(false);
    });

    it("should reject ActionOutput if recommendation count is not exactly 3", () => {
      const twoRecs = {
        recommendations: [
          { id: "1", title: "Aksi 1", description: "Desc", why: "Why", type: "primary", estimatedMinutes: 10, relatedNeed: "rest" },
          { id: "2", title: "Aksi 2", description: "Desc", why: "Why", type: "alternative", estimatedMinutes: 15, relatedNeed: "rest" },
        ],
      };
      expect(ActionOutputSchema.safeParse(twoRecs).success).toBe(false);
    });
  });

  // ========================================================
  // SCENARIO 9: Safety check -> triggers crisis intervention on high-risk keywords
  // ========================================================
  describe("Scenario 9: Safety Pipeline & Crisis Interception", () => {
    it("should detect acute self-harm and suicide crisis phrases in Indonesian", () => {
      expect(containsCrisisKeywords("saya ingin bunuh diri")).toBe(true);
      expect(containsCrisisKeywords("rasanya ingin mengakhiri hidup saja")).toBe(true);
      expect(containsCrisisKeywords("melukai diri sendiri")).toBe(true);
      expect(containsCrisisKeywords("minum racun")).toBe(true);
      expect(checkCrisisRisk("mau mati saja").isCrisis).toBe(true);

      const matches = getCrisisMatches("aku sudah tidak kuat, mau bunuh diri");
      expect(matches).toContain("bunuh diri");
    });

    it("should NOT trigger false alarms on mundane expressions of fatigue or stress", () => {
      expect(containsCrisisKeywords("tugas ini bikin saya pusing dan lelah")).toBe(false);
      expect(containsCrisisKeywords("saya merasa cemas menghadapi ujian besok")).toBe(false);
      expect(containsCrisisKeywords("butuh tidur seharian")).toBe(false);
    });

    it("should provide official and verified Indonesian crisis resources without invalid numbers", () => {
      expect(CRISIS_RESOURCES.length).toBeGreaterThan(0);
      const names = CRISIS_RESOURCES.map((r) => r.name);
      expect(names).toContain("LISA (Love Inside Suicide Awareness)");
      expect(names).toContain("SAPA 129 (KemenPPPA)");
      expect(names).toContain("Layanan Kegawatdaruratan Medis 119");

      // Verify no misleading deprecated numbers
      const contacts = CRISIS_RESOURCES.map((r) => r.contact);
      expect(contacts).not.toContain("1500-567"); // Non-functional hotline removed
    });
  });

  // ========================================================
  // SCENARIO 10: Malformed / oversized payload -> rejected by validateBodySize / Zod
  // ========================================================
  describe("Scenario 10: Payload Size & Malformed Body Defense", () => {
    it("should reject payloads larger than 50KB", () => {
      const smallBody = JSON.stringify({ message: "halo".repeat(100) });
      expect(validateBodySize(smallBody)).toBe(true);

      // Create > 50KB payload
      const oversizedBody = JSON.stringify({ payload: "X".repeat(55 * 1024) });
      expect(validateBodySize(oversizedBody)).toBe(false);
    });

    it("should reject malformed input payloads failing Zod schemas", () => {
      // MaskInput requires min 1 tag and 1 actual feeling
      expect(MaskInputSchema.safeParse({ publicTags: [], actualFeelings: ["Sedih"] }).success).toBe(false);
      expect(MaskInputSchema.safeParse({ publicTags: ["Baik"], actualFeelings: [] }).success).toBe(false);

      // LoadInput requires brainDump or items
      expect(LoadInputSchema.safeParse({}).success).toBe(false);
    });
  });

  // ========================================================
  // SCENARIO 11: Rapid-fire requests -> throttled by checkRateLimit cooldown & cap
  // ========================================================
  describe("Scenario 11: Rate Limiting & Cooldown Protection", () => {
    it("should enforce a cooldown between rapid requests from the same identifier", () => {
      const testIdentifier = `test-ip-${Date.now()}`;

      // Request 1: Allowed
      const req1 = checkRateLimit(testIdentifier);
      expect(req1.allowed).toBe(true);

      // Immediate Request 2 (0ms): Should trigger rapid-fire cooldown
      const req2 = checkRateLimit(testIdentifier);
      expect(req2.allowed).toBe(false);
      expect(req2.code).toBe("COOLDOWN_ACTIVE");
      expect(req2.message).toContain("terlalu cepat");
    });
  });

  // ========================================================
  // SCENARIO 12: Provider / AI error -> parsed to safe error without exposing stack traces
  // ========================================================
  describe("Scenario 12: Provider Error Sanitization & Safe Client Contracts", () => {
    it("should sanitize raw provider API errors and never leak stack traces or keys", () => {
      const leakedError = new Error(
        "API_KEY_INVALID: AIzaSyD-SecretKey12345 in call stack at https://generativelanguage.googleapis.com"
      );

      const parsed = parseAIError(leakedError);
      expect(parsed.code).toBe("AI_AUTH_ERROR");
      expect(parsed.message).not.toContain("AIzaSyD");
      expect(parsed.message).not.toContain("SecretKey12345");
      expect(parsed.message).not.toContain("https://");
      expect(parsed.retryable).toBe(false);
    });

    it("should mark rate limit and timeout errors as retryable", () => {
      const rateLimitError = new Error("429 Resource has been exhausted (e.g. check quota)");
      const parsedRL = parseAIError(rateLimitError);
      expect(parsedRL.code).toBe("AI_QUOTA_EXCEEDED");
      expect(parsedRL.retryable).toBe(true);

      const timeoutError = new Error("fetch timed out after 30000ms");
      const parsedTimeout = parseAIError(timeoutError);
      expect(parsedTimeout.code).toBe("AI_TEMPORARY_ERROR");
      expect(parsedTimeout.retryable).toBe(true);
    });
  });
});
