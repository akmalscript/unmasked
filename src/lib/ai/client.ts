import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { getModelForTask, type AITask } from "./models";

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Model routing UNMASKED:
 *
 * Standard tasks:
 * - gemini-3.5-flash-lite
 *
 * Complex reasoning tasks:
 * - gemini-3.8-flash
 *
 * Safety V2:
 * - gemini-3.5-flash-lite
 *
 * Fallback:
 * - Standard → Complex
 * - Complex → Standard
 */

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
 * Eksekusi model dengan validasi skema.
 * - allowRepair=true (Primary): Maksimal 1x attempt repair jika skema atau syntax invalid.
 * - allowRepair=false (Fallback): 1x initial call saja. Jika invalid, langsung fail ke safe error.
 */
async function runModel<T>(
  ai: GoogleGenAI,
  model: string,
  allowRepair: boolean,
  prompt: string,
  schema: z.ZodSchema<T>,
  systemInstruction?: string
): Promise<{ data: T; modelUsed: string }> {
  const response = await ai.models.generateContent({
    model,
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
  let jsonParseFailed = false;

  try {
    parsedJson = JSON.parse(cleaned);
  } catch {
    jsonParseFailed = true;
    if (!allowRepair) {
      throw new Error(`VALIDATION_ERROR: Invalid JSON syntax from model ${model}`);
    }
  }

  if (!jsonParseFailed) {
    const parseResult = schema.safeParse(parsedJson);
    if (parseResult.success) {
      return {
        data: parseResult.data,
        modelUsed: model,
      };
    }
    if (!allowRepair) {
      throw new Error(`VALIDATION_ERROR: ${parseResult.error.message}`);
    }
  }

  // Exactly 1 repair attempt (hanya diizinkan untuk model primer)
  console.warn(`[AI Client] Model ${model} output invalid. Menjalankan 1x repair...`);
  const repairPrompt = jsonParseFailed
    ? `Perbaiki output berikut agar menjadi JSON valid tanpa teks penjelasan:\n${cleaned}`
    : `JSON berikut tidak memenuhi skema validasi yang diminta:\n${JSON.stringify(parsedJson, null, 2)}\n\nHarap perbaiki dan kembalikan HANYA JSON valid sesuai skema asli:\n${prompt}`;

  const repairResponse = await ai.models.generateContent({
    model,
    contents: repairPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 1200,
    },
  });

  const repText = repairResponse.text;
  if (!repText) throw new Error("Repair attempt returned empty text");

  const repairedCleaned = cleanJSONString(repText);
  const repairedJson = JSON.parse(repairedCleaned);
  const secondValidation = schema.safeParse(repairedJson);

  if (secondValidation.success) {
    return {
      data: secondValidation.data,
      modelUsed: `${model}-repaired`,
    };
  }

  throw new Error(`VALIDATION_ERROR: ${secondValidation.error.message}`);
}

export interface GenerateStructuredAIOptions {
  task: AITask;
  systemInstruction?: string;
}

/**
 * Generate structured content using Gemini with deterministic fallback and at most 1 repair attempt.
 * Prioritas 6, 11, 12 & Model Routing Optimization:
 * 1. Panggil Primary Model sesuai task (maksimal 1 repair jika output invalid)
 * 2. Jika gagal: coba Fallback Model sesuai task (1x initial call saja, tanpa repair)
 * 3. Jika tetap gagal: throw safe error tanpa membocorkan detail teknis
 */
export async function generateStructuredAI<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options: GenerateStructuredAIOptions
): Promise<{ data: T; modelUsed: string }> {
  const ai = getGenAIClient();
  const { primary, fallback } = getModelForTask(options.task);

  try {
    const result = await runModel(ai, primary, true, prompt, schema, options.systemInstruction);
    console.info(`[AI] task=${options.task} model=${result.modelUsed}`);
    return result;
  } catch (primaryError) {
    const raw = primaryError instanceof Error ? primaryError.message : String(primaryError);

    // Jika error non-retryable (401, 403, PERMISSION_DENIED), jangan buang request ke fallback
    if (
      raw.includes("401") ||
      raw.includes("403") ||
      raw.includes("PERMISSION_DENIED") ||
      raw === "GEMINI_API_KEY_MISSING"
    ) {
      const safeErr = parseAIError(primaryError);
      const errorObj = new Error(safeErr.message);
      (errorObj as unknown as SafeAIError).code = safeErr.code;
      (errorObj as unknown as SafeAIError).retryable = safeErr.retryable;
      (errorObj as unknown as SafeAIError).statusCode = safeErr.statusCode;
      throw errorObj;
    }

    console.warn(`[AI Client] Primary model (${primary}) failed for task ${options.task}. Fallback ke ${fallback}...`, raw);

    try {
      const result = await runModel(ai, fallback, false, prompt, schema, options.systemInstruction);
      console.info(`[AI] task=${options.task} model=${result.modelUsed}`);
      return result;
    } catch (fallbackError) {
      console.error(`[AI Client] Fallback model (${fallback}) also failed for task ${options.task}:`, fallbackError);
      const safeErr = parseAIError(fallbackError);
      const errorObj = new Error(safeErr.message);
      (errorObj as unknown as SafeAIError).code = safeErr.code;
      (errorObj as unknown as SafeAIError).retryable = safeErr.retryable;
      (errorObj as unknown as SafeAIError).statusCode = safeErr.statusCode;
      throw errorObj;
    }
  }
}
