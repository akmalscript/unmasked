import { GoogleGenAI } from "@google/genai";
import { SafetyAssessmentSchema, type SafetyAssessment } from "@/schemas/safety";
import { SAFETY_SYSTEM_INSTRUCTION, buildActionSafetyPrompt } from "@/lib/ai/prompts";
import { SAFETY_MODEL } from "./aiAssessment";
import { checkExplicitDeterministicRisk } from "./crisisKeywords";

export interface ActionSafetyResult {
  isSafe: boolean;
  intervention?: SafetyAssessment;
}

const ACTION_SAFETY_TIMEOUT_MS = 6000;

/**
 * Menilai keamanan dari rekomendasi langkah aksi yang digenerate oleh AI (Output Safety Gate).
 * Memastikan AI tidak merekomendasikan tindakan yang membahayakan fisik, konfrontasi berbahaya,
 * atau tindakan ekstrem yang dapat mencederai pengguna.
 */
export async function assessGeneratedActionSafety(params: {
  userContext: string;
  recommendations: unknown;
}): Promise<ActionSafetyResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Jika API key tidak ada, gunakan pemeriksaan deterministik lokal
    return fallbackActionSafety(params.recommendations);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildActionSafetyPrompt(params);

    const apiCall = ai.models.generateContent({
      model: SAFETY_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 500,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("ACTION_SAFETY_TIMEOUT")), ACTION_SAFETY_TIMEOUT_MS);
    });

    const response = await Promise.race([apiCall, timeoutPromise]);
    const text = response.text;
    if (!text) {
      return fallbackActionSafety(params.recommendations);
    }

    const parsedJson = JSON.parse(text);
    const parsed = SafetyAssessmentSchema.safeParse(parsedJson);

    if (!parsed.success) {
      return fallbackActionSafety(params.recommendations);
    }

    const assessment = parsed.data;
    if (assessment.riskLevel === "high" || assessment.riskLevel === "critical" || assessment.category === "unsafe_action") {
      return {
        isSafe: false,
        intervention: {
          ...assessment,
          source: "ai",
        },
      };
    }

    return { isSafe: true };
  } catch (error) {
    console.warn("[ActionSafety] AI check failed, using fallback:", error);
    return fallbackActionSafety(params.recommendations);
  }
}

function fallbackActionSafety(recommendations: unknown): ActionSafetyResult {
  const text = JSON.stringify(recommendations || "");
  const fallback = checkExplicitDeterministicRisk(text);

  if (fallback.isCrisis) {
    return {
      isSafe: false,
      intervention: {
        ...fallback.assessment,
        category: "unsafe_action",
        supportiveResponse:
          "Langkah aksi yang terencana berpotensi membebani atau membahayakan kondisimu saat ini. Lebih aman untuk mengambil langkah yang lebih tenang dan mencari pendampingan terpercaya.",
        saferNextStep: "Berhenti sejenak dan bicarakan situasimu dengan orang yang kamu percaya.",
      },
    };
  }

  return { isSafe: true };
}
