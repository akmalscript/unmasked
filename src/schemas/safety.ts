import { z } from "zod";

export const SafetyRiskLevelSchema = z.enum([
  "safe",
  "concern",
  "high",
  "critical",
]);
export type SafetyRiskLevel = z.infer<typeof SafetyRiskLevelSchema>;

export const SafetyCategorySchema = z.enum([
  "none",
  "emotional_distress",
  "self_harm",
  "suicidal_risk",
  "harm_to_others",
  "imminent_physical_danger",
  "abuse",
  "unsafe_action",
  "other",
]);
export type SafetyCategory = z.infer<typeof SafetyCategorySchema>;

export const SafetyConfidenceSchema = z.enum([
  "low",
  "medium",
  "high",
]);
export type SafetyConfidence = z.infer<typeof SafetyConfidenceSchema>;

export const SafetySourceSchema = z.enum([
  "ai",
  "deterministic",
  "combined",
]);
export type SafetySource = z.infer<typeof SafetySourceSchema>;

export const SafetyAssessmentSchema = z.object({
  riskLevel: SafetyRiskLevelSchema,
  confidence: SafetyConfidenceSchema,
  category: SafetyCategorySchema,
  isDirectlyAboutUser: z.boolean(),
  isCurrentOrImminent: z.boolean(),
  signals: z.array(z.string().trim().min(1).max(250)).max(3),
  supportiveResponse: z.string().trim().min(20).max(800),
  saferNextStep: z.string().trim().min(10).max(500),
  recommendedResourceIds: z.array(z.string().trim().min(1).max(80)).max(5),
  source: SafetySourceSchema.optional(),
});
export type SafetyAssessment = z.infer<typeof SafetyAssessmentSchema>;

export const SafetyAssessmentInputSchema = z.object({
  stage: z.enum([
    "mask",
    "load",
    "need_prepare",
    "need_synthesize",
    "action",
    "summary",
    "general",
  ]),
  userText: z.string().trim().max(6000),
  contextualData: z.string().trim().max(6000).optional(),
});
export type SafetyAssessmentInput = z.infer<typeof SafetyAssessmentInputSchema>;

export const SafetyInterventionSchema = z.object({
  riskLevel: z.enum(["high", "critical"]),
  category: SafetyCategorySchema,
  supportiveResponse: z.string().trim(),
  saferNextStep: z.string().trim(),
  recommendedResourceIds: z.array(z.string().trim()),
});
export type SafetyIntervention = z.infer<typeof SafetyInterventionSchema>;
