import { describe, it, expect, beforeEach } from "vitest";
import {
  useJournalStore,
  isMaskCompleted,
  isLoadCompleted,
  isNeedCompleted,
  isActionSelected,
  canProceedToSummary,
  getConfirmedNeed,
  getConfirmedLoadThemes,
} from "@/store/useJournalStore";
import { useSafetyUIStore } from "@/store/useSafetyUIStore";
import {
  createGroundingMaskInsight,
  createGroundingLoadInsight,
  createGroundingNeedQuestions,
  createGroundingNeedInsight,
  createGroundingActionRecommendations,
  createGroundingSummaryData,
} from "@/lib/safety/groundingFallbacks";

describe("Journey Deadlock Prevention & Safety Resilience Suite", () => {
  beforeEach(() => {
    useJournalStore.getState().clearAllData();
    useSafetyUIStore.setState({
      isModalOpen: false,
      isCompanionVisible: false,
      modalMode: "manual",
      intervention: null,
    });
  });

  // ========================================================
  // 1. Grounding Fallback Unit Tests
  // ========================================================
  describe("Grounding Fallbacks Generators", () => {
    it("should generate valid MaskInsight satisfying isMaskCompleted", () => {
      const publicTags = ["Produktif", "Ramah"];
      const actualFeelings = ["Kelelahan", "Cemas"];
      const fallback = createGroundingMaskInsight(publicTags, actualFeelings);

      expect(fallback.contrasts.length).toBeGreaterThan(0);
      expect(fallback.reflection).toBeTruthy();
      expect(fallback.confidence).toBe("high");

      const completed = isMaskCompleted({
        publicTags,
        actualFeelings,
        maskInsight: fallback,
      });
      expect(completed).toBe(true);
    });

    it("should generate valid LoadInsight satisfying isLoadCompleted and theme extraction", () => {
      const brainDump = "Saya merasa sangat lelah dan beban ini menumpuk.";
      const stickyNotes = [{ id: "n1", text: "tugas menumpuk", color: "pink" as const, rotate: 0, side: "left" as const, order: 1 }];
      const fallback = createGroundingLoadInsight(brainDump, stickyNotes);

      expect(fallback.summary).toBeTruthy();
      expect(fallback.themes.length).toBeGreaterThanOrEqual(2);
      expect(fallback.themes[0].name).toBe("Kelelahan Batin");

      const completed = isLoadCompleted({
        brainDump,
        stickyNotes,
        loadInsight: fallback,
      });
      expect(completed).toBe(true);

      const confirmedThemes = getConfirmedLoadThemes({
        loadInsight: fallback,
        loadConfirmation: null,
      });
      expect(confirmedThemes).toContain("Kelelahan Batin");
      expect(confirmedThemes).toContain("Kebutuhan Ruang Aman");
    });

    it("should generate valid Need Questions and Candidate Needs", () => {
      const { candidates, questions } = createGroundingNeedQuestions();

      expect(candidates.length).toBe(3);
      expect(questions.length).toBe(2);
      expect(questions[0].question.length).toBeGreaterThan(10);
      expect(questions.every((q) => q.id.startsWith("q_grounding"))).toBe(true);
    });

    it("should generate valid NeedInsight satisfying getConfirmedNeed and isNeedCompleted", () => {
      const fallback = createGroundingNeedInsight();

      expect(fallback.primaryNeed.title).toContain("Ruang Bernapas");
      expect(fallback.primaryNeed.key).toBe("safety");

      const confirmed = getConfirmedNeed({
        needInsight: fallback,
        needConfirmation: null,
      });
      expect(confirmed?.title).toBe(fallback.primaryNeed.title);

      const completed = isNeedCompleted({
        needQuestions: [{ id: "q1", question: "Apa kebutuhanmu?", targetNeed: "safety", type: "open" }],
        needAnswers: [{ questionId: "q1", answer: "Butuh istirahat" }],
        needInsight: fallback,
      });
      expect(completed).toBe(true);
    });

    it("should generate 3 distinct ActionRecommendations covering primary, low_energy, and alternative", () => {
      const recs = createGroundingActionRecommendations();

      expect(recs.length).toBe(3);
      expect(recs.map((r) => r.type)).toEqual(["primary", "low_energy", "alternative"]);
      expect(recs.every((r) => r.estimatedMinutes && r.estimatedMinutes <= 15)).toBe(true);
    });

    it("should generate complete SummaryStage data", () => {
      const summary = createGroundingSummaryData(
        ["Produktif"],
        ["Kelelahan Batin"],
        ["Ruang Bernapas"],
        "Tarik Napas & Beri Jeda 5 Menit"
      );

      expect(summary.whatYouShow).toEqual(["Produktif"]);
      expect(summary.whatYouCarry).toEqual(["Kelelahan Batin"]);
      expect(summary.whatYouMayNeed).toEqual(["Ruang Bernapas"]);
      expect(summary.reflection).toBeTruthy();
    });
  });

  // ========================================================
  // 2. Full Journey Simulation: Safety Trigger at MASK
  // ========================================================
  describe("Journey Flow: Safety Triggered at MASK Stage", () => {
    it("should allow completing entire journey without deadlock when MASK triggers safety", () => {
      const store = useJournalStore.getState();

      // Step 1: User fills MASK tags & notes
      store.togglePublicTag("Kuat");
      store.toggleActualFeeling("Hancur");
      store.setFeelingNote("Saya ingin mati saja");

      // Safety intervention occurs
      useSafetyUIStore.getState().openIntervention({
        riskLevel: "critical",
        category: "suicidal_risk",
        supportiveResponse: "Ada bagian yang perlu kita perhatikan sebentar.",
        saferNextStep: "Beri jeda dan hubungi bantuan profesional.",
        recommendedResourceIds: ["healing119"],
      });

      // Grounding insight applied
      const maskGrounding = createGroundingMaskInsight(
        useJournalStore.getState().publicTags,
        useJournalStore.getState().actualFeelings,
        "Ada bagian yang perlu kita perhatikan sebentar."
      );
      useJournalStore.getState().setMaskInsight(maskGrounding);

      // User closes modal -> companion is active
      useSafetyUIStore.getState().closeToCompanion();
      expect(useSafetyUIStore.getState().isModalOpen).toBe(false);
      expect(useSafetyUIStore.getState().isCompanionVisible).toBe(true);

      // Verify MASK is completed
      expect(isMaskCompleted(useJournalStore.getState())).toBe(true);

      // Step 2: LOAD
      useJournalStore.getState().setBrainDump("Banyak tekanan hidup.");
      const loadGrounding = createGroundingLoadInsight("Banyak tekanan hidup.", []);
      useJournalStore.getState().setLoadInsight(loadGrounding);
      expect(isLoadCompleted(useJournalStore.getState())).toBe(true);

      // Step 3: NEED
      const { candidates, questions } = createGroundingNeedQuestions();
      useJournalStore.getState().setNeedCandidatesAndQuestions(candidates, questions);
      useJournalStore.getState().setNeedAnswer("q_grounding_1", "Butuh ruang aman");
      useJournalStore.getState().setNeedAnswer("q_grounding_2", "Ada teman dekat");

      const needGrounding = createGroundingNeedInsight();
      useJournalStore.getState().setNeedInsight(needGrounding);
      expect(isNeedCompleted(useJournalStore.getState())).toBe(true);

      // Step 4: ACTION
      const actionRecs = createGroundingActionRecommendations();
      useJournalStore.getState().setActionRecommendations(actionRecs);
      useJournalStore.getState().setSelectedAction(actionRecs[0].title + " — " + actionRecs[0].description, actionRecs[0].id);
      expect(isActionSelected(useJournalStore.getState())).toBe(true);

      // Final check: canProceedToSummary must be TRUE!
      expect(canProceedToSummary(useJournalStore.getState())).toBe(true);
    });
  });

  // ========================================================
  // 3. Full Journey Simulation: Safety Trigger at LOAD Stage
  // ========================================================
  describe("Journey Flow: Safety Triggered at LOAD Stage", () => {
    it("should allow completing entire journey without deadlock when LOAD triggers safety", () => {
      const store = useJournalStore.getState();

      // MASK completed normally
      store.togglePublicTag("Tenang");
      store.toggleActualFeeling("Kelelahan");
      store.setMaskInsight({
        contrasts: [{ publicTrait: "Tenang", internalState: "Kelelahan", interpretation: "Topeng" }],
        reflection: "Refleksi tenang vs lelah",
        confidence: "high",
      });
      expect(isMaskCompleted(useJournalStore.getState())).toBe(true);

      // LOAD triggers safety
      store.setBrainDump("Saya tidak sanggup lagi, mau bunuh diri saja.");
      useSafetyUIStore.getState().openIntervention({
        riskLevel: "critical",
        category: "suicidal_risk",
        supportiveResponse: "Mari berhenti sebentar dan bernapas.",
        saferNextStep: "Istirahat dan hubungi orang terpercaya.",
        recommendedResourceIds: ["healing119"],
      });

      // Grounding load insight applied
      const loadGrounding = createGroundingLoadInsight(
        "Saya tidak sanggup lagi, mau bunuh diri saja.",
        [],
        "Mari berhenti sebentar dan bernapas."
      );
      store.setLoadInsight(loadGrounding);

      // User closes modal
      useSafetyUIStore.getState().closeToCompanion();

      // Crucial: LOAD context exists so NEED sheet does NOT block user
      expect(isLoadCompleted(useJournalStore.getState())).toBe(true);
      const themes = getConfirmedLoadThemes(useJournalStore.getState());
      expect(themes.length).toBeGreaterThan(0);

      // NEED proceeds smoothly
      const { candidates, questions } = createGroundingNeedQuestions();
      store.setNeedCandidatesAndQuestions(candidates, questions);
      store.setNeedAnswer("q_grounding_1", "Ingin rebahan dan tenang");
      store.setNeedAnswer("q_grounding_2", "Ibu atau konselor");
      store.setNeedInsight(createGroundingNeedInsight());
      expect(isNeedCompleted(useJournalStore.getState())).toBe(true);

      // ACTION proceeds smoothly
      const recs = createGroundingActionRecommendations();
      store.setActionRecommendations(recs);
      store.setSelectedAction(recs[0].title, recs[0].id);

      // SUMMARY unblocked
      expect(canProceedToSummary(useJournalStore.getState())).toBe(true);
    });
  });

  // ========================================================
  // 4. Safety Modal & Floating Companion Lifecycle
  // ========================================================
  describe("Safety Modal & Companion UI Transitions", () => {
    it("should transition seamlessly from modal -> companion -> modal without getting stuck", () => {
      const safetyUI = useSafetyUIStore.getState();

      // Trigger intervention
      safetyUI.openIntervention({
        riskLevel: "high",
        category: "self_harm",
        supportiveResponse: "Beri jeda sejenak.",
        saferNextStep: "Ganti dengan memegang es batu atau tarik napas.",
        recommendedResourceIds: ["healing119"],
      });

      expect(useSafetyUIStore.getState().isModalOpen).toBe(true);
      expect(useSafetyUIStore.getState().isCompanionVisible).toBe(false);

      // Close to companion
      useSafetyUIStore.getState().closeToCompanion();
      expect(useSafetyUIStore.getState().isModalOpen).toBe(false);
      expect(useSafetyUIStore.getState().isCompanionVisible).toBe(true);

      // Reopen from companion
      useSafetyUIStore.getState().reopenIntervention();
      expect(useSafetyUIStore.getState().isModalOpen).toBe(true);
      expect(useSafetyUIStore.getState().isCompanionVisible).toBe(false);

      // Dismiss companion
      useSafetyUIStore.getState().closeToCompanion();
      useSafetyUIStore.getState().dismissCompanion();
      expect(useSafetyUIStore.getState().isCompanionVisible).toBe(false);
    });
  });
});
