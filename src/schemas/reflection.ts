import { z } from "zod";

export const MaskContrastSchema = z.object({
  publicTrait: z.string(),
  internalState: z.string(),
  interpretation: z.string(),
});

export const MaskInsightSchema = z.object({
  contrasts: z.array(MaskContrastSchema),
  reflection: z.string(),
  question: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export const LoadThemeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  relevance: z.enum(["low", "medium", "high"]).default("medium"),
});

export const EmotionalContextSchema = z.object({
  label: z.string(),
  intensity: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

export const LoadPatternSchema = z.object({
  description: z.string(),
  relatedThemes: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export const LoadInsightSchema = z.object({
  themes: z.array(LoadThemeSchema),
  emotionalContext: z.array(EmotionalContextSchema),
  patterns: z.array(LoadPatternSchema),
  summary: z.string(),
  question: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export const CandidateNeedSchema = z.object({
  key: z.enum(["rest", "control", "connection", "expression", "support", "safety"]),
  title: z.string(),
  reason: z.string(),
  relevance: z.enum(["low", "medium", "high"]).default("medium"),
});

export const NeedQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  targetNeed: z.enum(["rest", "control", "connection", "expression", "support", "safety"]),
  type: z.enum(["open", "choice"]).default("open"),
  options: z.array(z.string()).optional(),
});

export const NeedPrepareOutputSchema = z.object({
  candidates: z.array(CandidateNeedSchema),
  questions: z.array(NeedQuestionSchema),
});

export const NeedInsightSchema = z.object({
  primaryNeed: CandidateNeedSchema,
  secondaryNeeds: z.array(CandidateNeedSchema).optional().default([]),
  explanation: z.string(),
  confidence: z.enum(["low", "medium", "high"]).default("medium"),
});

export const ActionRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  why: z.string(),
  type: z.enum(["primary", "alternative", "low_energy"]),
  estimatedMinutes: z.number().optional().default(15),
  difficulty: z.enum(["low", "medium"]).optional().default("low"),
  relatedNeed: z.string(),
});

export const ActionOutputSchema = z.object({
  recommendations: z.array(ActionRecommendationSchema),
});

export const SummaryOutputSchema = z.object({
  whatYouShow: z.array(z.string()),
  whatYouCarry: z.array(z.string()),
  whatYouMayNeed: z.array(z.string()),
  nextStep: z.string(),
  reflection: z.string(),
});
