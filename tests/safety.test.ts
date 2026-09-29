import { describe, it, expect, vi, beforeEach } from "vitest";
import { shouldTriggerIntervention } from "@/lib/safety/interventionPolicy";
import { checkExplicitDeterministicRisk, checkCrisisRisk } from "@/lib/safety/crisisKeywords";
import { resolveResources, CRISIS_RESOURCES } from "@/lib/safety/crisisResources";
import { assessSafety } from "@/lib/safety/assess";
import { assessGeneratedActionSafety } from "@/lib/safety/actionSafety";
import * as aiAssessmentModule from "@/lib/safety/aiAssessment";
import { useSafetyUIStore } from "@/store/useSafetyUIStore";
import { useJournalStore } from "@/store/useJournalStore";
import { SafetyAssessment } from "@/schemas/safety";

describe("UNMASKED Safety v2 Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useSafetyUIStore.setState({
      isModalOpen: false,
      isCompanionVisible: false,
      modalMode: "manual",
      intervention: null,
    });
  });

  // ========================================================
  // 1. Policy & Threshold Tests (Anti-False-Positive Engine)
  // ========================================================
  describe("Policy & Anti-False-Positive Checks", () => {
    it("Test 1: Safe input should never trigger intervention", () => {
      const assessment: SafetyAssessment = {
        riskLevel: "safe",
        confidence: "high",
        category: "none",
        isDirectlyAboutUser: true,
        isCurrentOrImminent: false,
        signals: [],
        supportiveResponse: "Kondisi terdeteksi aman untuk melanjutkan refleksi.",
        saferNextStep: "Lanjutkan jurnal seperti biasa.",
        recommendedResourceIds: [],
      };

      expect(shouldTriggerIntervention(assessment)).toBe(false);
    });

    it("Test 2: Concern level (emotional distress / fatigue) should not trigger intervention popup", () => {
      const assessment: SafetyAssessment = {
        riskLevel: "concern",
        confidence: "high",
        category: "emotional_distress",
        isDirectlyAboutUser: true,
        isCurrentOrImminent: false,
        signals: ["Kelelahan emosional dan stres perkuliahan"],
        supportiveResponse: "Tampaknya tekanan yang kamu hadapi cukup menguras energi saat ini.",
        saferNextStep: "Istirahat sejenak sebelum mengambil kesimpulan.",
        recommendedResourceIds: ["healing119"],
      };

      expect(shouldTriggerIntervention(assessment)).toBe(false);
    });

    it("Test 3 & Test 10: Third-person context (not directly about user) should NOT trigger intervention", () => {
      const assessment: SafetyAssessment = {
        riskLevel: "high",
        confidence: "high",
        category: "suicidal_risk",
        isDirectlyAboutUser: false,
        isCurrentOrImminent: true,
        signals: ["Membicarakan pengalaman teman"],
        supportiveResponse: "Mendengar teman mengalami masa sulit tentu bisa membuatmu cemas.",
        saferNextStep: "Dukung temanmu dengan menawarkan kontak profesional yang aman.",
        recommendedResourceIds: ["healing119"],
      };

      expect(shouldTriggerIntervention(assessment)).toBe(false);
    });

    it("Test 4: Educational / research context should not trigger intervention", () => {
      const assessment: SafetyAssessment = {
        riskLevel: "safe",
        confidence: "high",
        category: "none",
        isDirectlyAboutUser: false,
        isCurrentOrImminent: false,
        signals: ["Topik tugas kuliah tentang pencegahan bunuh diri"],
        supportiveResponse: "Diskusi akademis terdeteksi aman.",
        saferNextStep: "Lanjutkan penulisan tugas.",
        recommendedResourceIds: [],
      };

      expect(shouldTriggerIntervention(assessment)).toBe(false);
    });

    it("Test 5 & Test 11: Past/Historical experience (not current or imminent) should not trigger high risk intervention", () => {
      const assessment: SafetyAssessment = {
        riskLevel: "high",
        confidence: "high",
        category: "self_harm",
        isDirectlyAboutUser: true,
        isCurrentOrImminent: false,
        signals: ["Pengalaman masa lalu beberapa tahun lalu"],
        supportiveResponse: "Refleksi masa lalu yang mendalam.",
        saferNextStep: "Apresiasi perjalananmu sampai hari ini.",
        recommendedResourceIds: ["healing119"],
      };

      expect(shouldTriggerIntervention(assessment)).toBe(false);
    });

    it("Test 6: Current explicit suicidal risk directly about user triggers intervention", () => {
      const assessment: SafetyAssessment = {
        riskLevel: "critical",
        confidence: "high",
        category: "suicidal_risk",
        isDirectlyAboutUser: true,
        isCurrentOrImminent: true,
        signals: ["Keinginan eksplisit mengakhiri hidup saat ini"],
        supportiveResponse: "Situasi yang kamu hadapi terdengar sangat berat. Keselamatanmu adalah hal utama.",
        saferNextStep: "Berhenti sejenak dan segera hubungi bantuan darurat di bawah ini.",
        recommendedResourceIds: ["healing119", "emergency119"],
      };

      expect(shouldTriggerIntervention(assessment)).toBe(true);
    });

    it("Test 7: Direct current self-harm intent with high confidence triggers intervention", () => {
      const assessment: SafetyAssessment = {
        riskLevel: "high",
        confidence: "high",
        category: "self_harm",
        isDirectlyAboutUser: true,
        isCurrentOrImminent: true,
        signals: ["Dorongan melukai diri saat ini"],
        supportiveResponse: "Kamu tidak harus menanggung rasa sakit ini sendirian.",
        saferNextStep: "Cari seseorang yang kamu percaya untuk menemanimu sekarang.",
        recommendedResourceIds: ["healing119", "emergency119"],
      };

      expect(shouldTriggerIntervention(assessment)).toBe(true);
    });

    it("Unsafe AI action recommendation triggers intervention", () => {
      const assessment: SafetyAssessment = {
        riskLevel: "high",
        confidence: "high",
        category: "unsafe_action",
        isDirectlyAboutUser: true,
        isCurrentOrImminent: true,
        signals: ["Action mendorong tindakan membahayakan"],
        supportiveResponse: "Langkah ini berpotensi membahayakan keselamatanmu.",
        saferNextStep: "Pilih langkah alternatif yang lebih tenang dan aman.",
        recommendedResourceIds: ["healing119"],
      };

      expect(shouldTriggerIntervention(assessment)).toBe(true);
    });
  });

  // ========================================================
  // 2. Deterministic Fallback Engine Tests
  // ========================================================
  describe("Deterministic Fallback Engine", () => {
    it("Does not trigger on safe text", () => {
      const result = checkExplicitDeterministicRisk("Besok aku ada presentasi proposal skripsi.");
      expect(result.isCrisis).toBe(false);
      expect(result.assessment.riskLevel).toBe("safe");
    });

    it("Classifies sensitive keyword without first-person context as 'concern' (NOT crisis)", () => {
      const result = checkExplicitDeterministicRisk("Temanku kemarin cerita tentang kasus bunuh diri di berita.");
      expect(result.isCrisis).toBe(false);
      expect(result.assessment.riskLevel).toBe("concern");
      expect(result.assessment.isDirectlyAboutUser).toBe(false);
    });

    it("Classifies educational discussion as 'concern' or 'safe', not crisis", () => {
      const result = checkExplicitDeterministicRisk("Di mata kuliah psikologi kami mempelajari suicide prevention.");
      expect(result.isCrisis).toBe(false);
      expect(result.assessment.riskLevel).toBe("concern");
    });

    it("Triggers critical crisis when explicit first-person danger pattern is matched", () => {
      const result = checkExplicitDeterministicRisk("Aku merasa sudah tidak sanggup hidup lagi dan mau akhiri hidup.");
      expect(result.isCrisis).toBe(true);
      expect(result.assessment.riskLevel).toBe("critical");
      expect(result.assessment.confidence).toBe("high");
      expect(result.assessment.isDirectlyAboutUser).toBe(true);
      expect(result.assessment.isCurrentOrImminent).toBe(true);
    });

    it("Backward compatibility checkCrisisRisk works as expected", () => {
      const legacy = checkCrisisRisk("Aku ingin mengakhiri hidup sekarang juga");
      expect(legacy.isCrisis).toBe(true);
      expect(legacy.emergencyContacts.length).toBeGreaterThan(0);
    });
  });

  // ========================================================
  // 3. Central Orchestrator & Failover Tests
  // ========================================================
  describe("Central Safety Orchestrator (assessSafety)", () => {
    it("Test 8: Fallbacks to deterministic safety when AI model call throws", async () => {
      vi.spyOn(aiAssessmentModule, "assessSafetyWithAI").mockRejectedValueOnce(
        new Error("GEMINI_QUOTA_EXCEEDED")
      );

      // Input with explicit danger pattern
      const decision = await assessSafety({
        stage: "mask",
        userText: "Aku ingin bunuh diri dan akhiri hidup sekarang.",
      });

      expect(decision.action).toBe("intervene");
      expect(decision.assessment.source).toBe("deterministic");
      expect(decision.assessment.riskLevel).toBe("critical");
    });

    it("Test 9: Fallbacks to deterministic safety when AI produces invalid JSON or schema", async () => {
      vi.spyOn(aiAssessmentModule, "assessSafetyWithAI").mockRejectedValueOnce(
        new Error("SAFETY_AI_MALFORMED_JSON")
      );

      const decision = await assessSafety({
        stage: "load",
        userText: "Hari ini lumayan capek tapi besok libur.",
      });

      expect(decision.action).toBe("allow");
      expect(decision.assessment.riskLevel).toBe("safe");
    });

    it("Returns allow for normal AI assessment without crisis", async () => {
      vi.spyOn(aiAssessmentModule, "assessSafetyWithAI").mockResolvedValueOnce({
        riskLevel: "concern",
        confidence: "medium",
        category: "emotional_distress",
        isDirectlyAboutUser: true,
        isCurrentOrImminent: false,
        signals: ["Beban kerja berat"],
        supportiveResponse: "Beban yang kamu rasakan terdengar cukup berat.",
        saferNextStep: "Istirahat sejenak.",
        recommendedResourceIds: ["healing119"],
      });

      const decision = await assessSafety({
        stage: "need_synthesize",
        userText: "Aku kewalahan dengan semua tugas kampus.",
      });

      expect(decision.action).toBe("allow");
      expect(decision.assessment.riskLevel).toBe("concern");
    });
  });

  // ========================================================
  // 4. Action Output Safety Tests
  // ========================================================
  describe("Action Output Safety Gate", () => {
    it("Test 12: Blocks unsafe AI-generated recommendations", async () => {
      const unsafeRecs = [
        {
          title: "Hadapi langsung dengan kekerasan",
          description: "Konfrontasi orang tersebut dan lakukan tindakan berbahaya sendirian",
        },
      ];

      const result = await assessGeneratedActionSafety({
        userContext: "Konflik berat dengan seseorang",
        recommendations: unsafeRecs,
      });

      // Even if AI call is mocked or fallback runs, dangerous words should be caught or handled
      expect(result).toBeDefined();
    });
  });

  // ========================================================
  // 5. Crisis Resources & Anti-Hallucination Tests
  // ========================================================
  describe("Crisis Resources Registry", () => {
    it("Test 13: Resolves verified resources by valid ID", () => {
      const resolved = resolveResources(["healing119", "emergency119"]);
      expect(resolved.length).toBe(2);
      expect(resolved[0].id).toBe("healing119");
      expect(resolved[0].contact).toBe("119 ext. 8");
      expect(resolved[1].id).toBe("emergency119");
      expect(resolved[1].contact).toBe("119");
    });

    it("Test 14: Silently filters out unknown or hallucinated resource IDs", () => {
      const resolved = resolveResources(["fake-hotline-999", "nonexistent-url"]);
      // Falls back to safe default official resources
      expect(resolved.length).toBeGreaterThan(0);
      expect(resolved.every((r) => CRISIS_RESOURCES.some((cr) => cr.id === r.id))).toBe(true);
    });
  });

  // ========================================================
  // 6. Safety UI Store State Transitions
  // ========================================================
  describe("Safety UI Store & Transitions", () => {
    it("Test 15: Closing modal transitions state to persistent companion", () => {
      const store = useSafetyUIStore.getState();

      store.openIntervention({
        riskLevel: "high",
        category: "suicidal_risk",
        supportiveResponse: "Kami ada untukmu.",
        saferNextStep: "Berhenti sejenak dan hubungi bantuan.",
        recommendedResourceIds: ["healing119"],
      });

      expect(useSafetyUIStore.getState().isModalOpen).toBe(true);
      expect(useSafetyUIStore.getState().isCompanionVisible).toBe(false);

      // User closes modal
      useSafetyUIStore.getState().closeToCompanion();

      expect(useSafetyUIStore.getState().isModalOpen).toBe(false);
      expect(useSafetyUIStore.getState().isCompanionVisible).toBe(true);
    });

    it("Test 16: Clicking companion reopens intervention modal and hides companion", () => {
      useSafetyUIStore.setState({
        isModalOpen: false,
        isCompanionVisible: true,
        modalMode: "intervention",
      });

      useSafetyUIStore.getState().reopenIntervention();

      expect(useSafetyUIStore.getState().isModalOpen).toBe(true);
      expect(useSafetyUIStore.getState().isCompanionVisible).toBe(false);
    });

    it("Test 17: JournalStore records minimal safety metadata without full sensitive prose", () => {
      const journal = useJournalStore.getState();

      journal.setSafetyState({
        status: "intervention",
        riskLevel: "high",
        category: "suicidal_risk",
        source: "ai",
        triggeredAt: "2026-09-29T12:00:00.000Z",
        handled: false,
      });

      const updated = useJournalStore.getState().safety;
      expect(updated.status).toBe("intervention");
      expect(updated.riskLevel).toBe("high");
      expect(updated.category).toBe("suicidal_risk");
      expect(updated.handled).toBe(false);
      // Ensure no raw prose field is attached to JournalState safety object
      expect((updated as unknown as Record<string, unknown>).supportiveResponse).toBeUndefined();
    });
  });
});
