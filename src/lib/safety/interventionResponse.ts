import { NextResponse } from "next/server";
import { SafetyAssessment } from "@/schemas/safety";
import { resolveResources } from "./crisisResources";

/**
 * Membentuk respons standar server ketika intervensi keselamatan dipicu.
 * Menjamin keseragaman kontrak data di seluruh endpoint AI.
 */
export function createSafetyInterventionResponse(assessment: SafetyAssessment) {
  const resolvedResources = resolveResources(assessment.recommendedResourceIds);

  return NextResponse.json(
    {
      success: false,
      code: "SAFETY_INTERVENTION",
      retryable: false,
      intervention: {
        riskLevel: assessment.riskLevel,
        category: assessment.category,
        supportiveResponse: assessment.supportiveResponse,
        saferNextStep: assessment.saferNextStep,
        recommendedResourceIds: assessment.recommendedResourceIds,
        recommendedResources: resolvedResources,
      },
      // Properti kompatibilitas mundur
      emergencyContacts: resolvedResources,
      riskLevel: assessment.riskLevel,
      message: assessment.supportiveResponse,
    },
    { status: 400 }
  );
}
