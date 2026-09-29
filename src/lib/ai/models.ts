/**
 * UNMASKED — Centralized Gemini Model Registry & Task Routing
 *
 * Mengoptimalkan penggunaan model Gemini berdasarkan kebutuhan reasoning tiap task:
 * - Standard tasks (mask, needPrepare, action, summary): gemini-3.5-flash-lite
 * - Complex reasoning tasks (load, needSynthesize): gemini-3.8-flash
 * - Safety assessment: gemini-3.5-flash-lite
 *
 * Fallback Policy:
 * - Standard task: primary gemini-3.5-flash-lite -> fallback gemini-3.8-flash
 * - Complex task: primary gemini-3.8-flash -> fallback gemini-3.5-flash-lite
 */

export const MODEL_CONFIG = {
  standard:
    process.env.GEMINI_STANDARD_MODEL ||
    "gemini-3.5-flash-lite",

  complex:
    process.env.GEMINI_COMPLEX_MODEL ||
    "gemini-3.8-flash",

  safety:
    process.env.GEMINI_SAFETY_MODEL ||
    "gemini-3.5-flash-lite",
} as const;

export type AITask =
  | "mask"
  | "load"
  | "needPrepare"
  | "needSynthesize"
  | "action"
  | "summary";

export type SafetyTask = "safety";

export const TASK_MODEL = {
  mask: MODEL_CONFIG.standard,
  load: MODEL_CONFIG.complex,
  needPrepare: MODEL_CONFIG.standard,
  needSynthesize: MODEL_CONFIG.complex,
  action: MODEL_CONFIG.standard,
  summary: MODEL_CONFIG.standard,
} as const;

export function getModelForTask(task: AITask): {
  primary: string;
  fallback: string;
} {
  const primary = TASK_MODEL[task];
  const fallback =
    primary === MODEL_CONFIG.complex
      ? MODEL_CONFIG.standard
      : MODEL_CONFIG.complex;

  return {
    primary,
    fallback,
  };
}
