import { GoogleGenAI } from "@google/genai";
import {
  SafetyAssessmentSchema,
  type SafetyAssessment,
  type SafetyAssessmentInput,
} from "@/schemas/safety";
import { SAFETY_SYSTEM_INSTRUCTION, buildSafetyPrompt } from "@/lib/ai/prompts";
import { MODEL_CONFIG } from "@/lib/ai/models";

export const SAFETY_MODEL = MODEL_CONFIG.safety;

const SAFETY_TIMEOUT_MS = 8000;

/**
 * Menilai keamanan input secara kontekstual menggunakan Gemini model cepat (gemini-3.5-flash-lite).
 * Didesain dengan latency rendah, cost-effective, tanpa repair loop.
 * Jika terjadi kegagalan (network, quota, parsing), error akan dilemparkan
 * agar sistem dapat beralih ke deterministic fallback secara terkontrol.
 */
export async function assessSafetyWithAI(
  input: SafetyAssessmentInput
): Promise<SafetyAssessment> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = buildSafetyPrompt({
    stage: input.stage,
    userText: input.userText,
    contextualData: input.contextualData,
  });

  const apiCall = ai.models.generateContent({
    model: SAFETY_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 700,
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("SAFETY_AI_TIMEOUT"));
    }, SAFETY_TIMEOUT_MS);
  });

  const response = await Promise.race([apiCall, timeoutPromise]);
  const text = response.text;

  if (!text || text.trim().length === 0) {
    throw new Error("SAFETY_AI_EMPTY_RESPONSE");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch (err) {
    console.warn("[Safety AI] Malformed JSON output:", text, err);
    throw new Error("SAFETY_AI_MALFORMED_JSON");
  }

  const parsed = SafetyAssessmentSchema.safeParse(parsedJson);
  if (!parsed.success) {
    console.warn("[Safety AI] Invalid output schema:", parsed.error);
    throw new Error("SAFETY_AI_INVALID_OUTPUT");
  }

  return {
    ...parsed.data,
    source: "ai",
  };
}
