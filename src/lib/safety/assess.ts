/**
 * Centralized Safety Orchestrator according to UNMASKED Safety v2 Specification.
 *
 * Satu-satunya gerbang evaluasi keselamatan untuk seluruh AI routes.
 * 1. AI Safety Assessment (Gemini 3.5 Flash-Lite)
 * 2. Anti-False-Positive Policy (shouldTriggerIntervention)
 * 3. Graceful Deterministic Fallback jika AI gagal
 */

import { SafetyAssessment, SafetyAssessmentInput } from "@/schemas/safety";
import { assessSafetyWithAI } from "./aiAssessment";
import { shouldTriggerIntervention } from "./interventionPolicy";
import { checkExplicitDeterministicRisk } from "./crisisKeywords";

export type SafetyDecision =
  | {
      action: "allow";
      assessment: SafetyAssessment;
    }
  | {
      action: "intervene";
      assessment: SafetyAssessment;
    };

export async function assessSafety(
  input: SafetyAssessmentInput
): Promise<SafetyDecision> {
  // Jika input kosong atau string hanya whitespace, izinkan dengan safe assessment
  if (!input.userText || input.userText.trim().length === 0) {
    return {
      action: "allow",
      assessment: {
        riskLevel: "safe",
        confidence: "high",
        category: "none",
        isDirectlyAboutUser: false,
        isCurrentOrImminent: false,
        signals: [],
        supportiveResponse: "Kondisi terdeteksi aman untuk melanjutkan refleksi.",
        saferNextStep: "Lanjutkan jurnal seperti biasa.",
        recommendedResourceIds: [],
        source: "deterministic",
      },
    };
  }

  try {
    const aiAssessment = await assessSafetyWithAI(input);
    const shouldIntervene = shouldTriggerIntervention(aiAssessment);

    return {
      action: shouldIntervene ? "intervene" : "allow",
      assessment: {
        ...aiAssessment,
        source: "ai",
      },
    };
  } catch (error) {
    console.warn(
      `[Safety] AI assessment failed for stage '${input.stage}'. Falling back to deterministic safety.`,
      error instanceof Error ? error.message : error
    );

    const fallback = checkExplicitDeterministicRisk(input.userText);

    return {
      action: fallback.isCrisis ? "intervene" : "allow",
      assessment: fallback.assessment,
    };
  }
}
