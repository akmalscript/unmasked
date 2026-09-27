import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const API_KEY = process.env.GEMINI_API_KEY || "";

function getGenAIClient(): GoogleGenAI {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
}

/**
 * Model deterministik sesuai Prioritas 11:
 * - Primary: Model cepat & ringan untuk refleksi terstruktur (gemini-2.5-flash)
 * - Fallback: Model cadangan stabil jika primary mengalami kendala sementara (gemini-2.0-flash)
 */
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

export interface SafeAIError {
  code: string;
  message: string;
  retryable: boolean;
  statusCode: number;
}

/**
 * Mengubah internal error menjadi SafeAIError sesuai Prioritas 12:
 * Tidak mengekspos raw Gemini/provider error, stack trace, atau detail teknis ke client.
 */
export function parseAIError(err: unknown): SafeAIError {
  const raw = err instanceof Error ? err.message : String(err);

  // Technical details logged on server only
  console.error("[Server AI Error Log]:", err);

  if (
    raw === "GEMINI_API_KEY_MISSING" ||
    raw.includes("API key not valid") ||
    raw.includes("API_KEY_INVALID") ||
    raw.includes("401")
  ) {
    return {
      code: "AI_AUTH_ERROR",
      message: "Layanan refleksi AI belum terhubung dengan benar. Silakan periksa konfigurasi server.",
      retryable: false,
      statusCode: 500,
    };
  }

  if (raw.includes("403") || raw.includes("PERMISSION_DENIED")) {
    return {
      code: "AI_PERMISSION_DENIED",
      message: "Akses ke model AI ditolak oleh server penyedia. Hubungi pengelola.",
      retryable: false,
      statusCode: 403,
    };
  }

  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.includes("quota")) {
    return {
      code: "AI_QUOTA_EXCEEDED",
      message: "Layanan refleksi sedang sibuk atau mencapai kuota harian. Silakan coba kembali sesaat lagi.",
      retryable: true,
      statusCode: 429,
    };
  }

  if (raw.includes("SAFETY_INTERVENTION")) {
    return {
      code: "SAFETY_INTERVENTION",
      message: "Input mengandung indikasi situasi krisis. Silakan akses kontak bantuan darurat.",
      retryable: false,
      statusCode: 400,
    };
  }

  if (raw.includes("VALIDATION_ERROR") || raw.includes("ZodError")) {
    return {
      code: "AI_OUTPUT_INVALID",
      message: "Hasil telaah AI tidak memenuhi format standar yang dibutuhkan. Coba lakukan analisis ulang.",
      retryable: true,
      statusCode: 422,
    };
  }

  const lower = raw.toLowerCase();
  if (
    lower.includes("503") ||
    lower.includes("unavailable") ||
    lower.includes("high demand") ||
    lower.includes("fetch failed") ||
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("econnreset")
  ) {
    return {
      code: "AI_TEMPORARY_ERROR",
      message: "Koneksi ke server refleksi mengalami gangguan sementara. Silakan coba lagi.",
      retryable: true,
      statusCode: 503,
    };
  }

  return {
    code: "AI_PROCESSING_ERROR",
    message: "Refleksi belum dapat diproses saat ini. Catatan dan pilihanmu tetap aman.",
    retryable: true,
    statusCode: 500,
  };
}

function cleanJSONString(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * Generate structured content using Gemini with deterministic fallback and at most 1 repair attempt.
 * Prioritas 6, 11, 12:
 * 1. Panggil Primary Model
 * 2. Validasi skema Zod
 * 3. Jika format invalid: lakukan MAKSIMAL 1 repair attempt
 * 4. Jika gagal jaringan/sementara: coba Fallback Model
 * 5. Jika tetap gagal: return controlled error tanpa fake psychological data
 */
export async function generateStructuredAI<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  systemInstruction?: string
): Promise<{ data: T; modelUsed: string }> {
  const ai = getGenAIClient();
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastCapturedError: unknown = null;

  for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
    const currentModel = modelsToTry[mIdx];
    try {
      // 1. Initial Call
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          systemInstruction:
            systemInstruction ||
            "You are UNMASKED Reflective Assistant. Follow strict non-diagnostic, tentative, calm, and empathetic guidelines. Return only valid JSON.",
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 1200,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI model");

      const cleaned = cleanJSONString(text);
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn(`[AI Client] Model ${currentModel} returned invalid JSON syntax:`, parseErr);
        // Attempt at most 1 repair for JSON syntax
        const repairResponse = await ai.models.generateContent({
          model: currentModel,
          contents: `Perbaiki JSON berikut agar menjadi valid JSON tanpa teks tambahan:\n${cleaned}`,
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 1200,
          },
        });
        const repText = repairResponse.text;
        if (!repText) throw new Error("Repair attempt returned empty text");
        parsedJson = JSON.parse(cleanJSONString(repText));
      }

      // 2. Validate against Zod schema
      const parseResult = schema.safeParse(parsedJson);
      if (parseResult.success) {
        return {
          data: parseResult.data,
          modelUsed: currentModel,
        };
      }

      // 3. Schema validation failed: Perform exactly 1 repair attempt with validation issues
      console.warn(`[AI Client] Model ${currentModel} output failed schema validation. Attempting 1 repair...`, parseResult.error.issues);
      const repairPrompt = `JSON berikut tidak memenuhi skema validasi yang diminta:\n${JSON.stringify(parsedJson, null, 2)}\n\nMasalah validasi:\n${JSON.stringify(parseResult.error.issues, null, 2)}\n\nHarap perbaiki dan kembalikan HANYA JSON valid sesuai skema asli:\n${prompt}`;

      const repairResponse = await ai.models.generateContent({
        model: currentModel,
        contents: repairPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      });

      const repairedCleaned = cleanJSONString(repairResponse.text || "");
      const repairedJson = JSON.parse(repairedCleaned);
      const secondValidation = schema.safeParse(repairedJson);

      if (secondValidation.success) {
        return {
          data: secondValidation.data,
          modelUsed: `${currentModel}-repaired`,
        };
      }

      throw new Error(`VALIDATION_ERROR: ${secondValidation.error.message}`);
    } catch (err: unknown) {
      lastCapturedError = err;
      const raw = err instanceof Error ? err.message : String(err);

      // Jika error non-retryable (misal invalid auth), jangan buang kuota ke model berikutnya
      if (raw.includes("401") || raw.includes("403") || raw.includes("PERMISSION_DENIED")) {
        console.warn(`[AI Client] Non-retryable error on ${currentModel}. Halting fallback.`);
        break;
      }

      console.warn(`[AI Client] Model ${currentModel} failed:`, raw);
    }
  }

  // Jika semua percobaan model & 1 repair gagal, parse error dan throw safe error
  const safeErr = parseAIError(lastCapturedError);
  const errorObj = new Error(safeErr.message);
  (errorObj as unknown as SafeAIError).code = safeErr.code;
  (errorObj as unknown as SafeAIError).retryable = safeErr.retryable;
  (errorObj as unknown as SafeAIError).statusCode = safeErr.statusCode;
  throw errorObj;
}
