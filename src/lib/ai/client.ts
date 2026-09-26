import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const API_KEY = process.env.GEMINI_API_KEY || "";

function getGenAIClient(): GoogleGenAI {
  if (!API_KEY) {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi di file .env.local. Silakan salin .env.example menjadi .env.local dan masukkan API Key Anda."
    );
  }
  return new GoogleGenAI({ apiKey: API_KEY });
}

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

export interface ParsedAIError {
  userFriendlyMessage: string;
  rawError: string;
  statusCode: number;
}

export function parseAIError(err: unknown): ParsedAIError {
  const raw = err instanceof Error ? err.message : String(err);

  if (
    raw.includes("401") ||
    raw.includes("UNAUTHENTICATED") ||
    raw.includes("invalid authentication") ||
    raw.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED")
  ) {
    return {
      userFriendlyMessage:
        "Kredensial API Gemini tidak valid atau telah kedaluwarsa. Mohon periksa kembali GEMINI_API_KEY di file konfigurasi (.env.local).",
      rawError: raw,
      statusCode: 401,
    };
  }

  if (
    raw.includes("403") ||
    raw.includes("PERMISSION_DENIED")
  ) {
    return {
      userFriendlyMessage:
        "Akses ke model AI Gemini ditolak. Pastikan izin API Key Anda sudah aktif.",
      rawError: raw,
      statusCode: 403,
    };
  }

  if (
    raw.includes("400") ||
    raw.includes("INVALID_ARGUMENT")
  ) {
    return {
      userFriendlyMessage:
        "Format data permintaan tidak valid. Silakan periksa kembali isian catatanmu.",
      rawError: raw,
      statusCode: 400,
    };
  }

  if (
    raw.includes("429") ||
    raw.includes("RESOURCE_EXHAUSTED") ||
    raw.includes("quota") ||
    raw.includes("rate limit")
  ) {
    return {
      userFriendlyMessage:
        "Batas frekuensi permintaan atau kuota AI sedang penuh. Silakan tunggu sejenak dan coba kembali.",
      rawError: raw,
      statusCode: 429,
    };
  }

  if (
    raw.includes("503") ||
    raw.includes("UNAVAILABLE") ||
    raw.includes("high demand")
  ) {
    return {
      userFriendlyMessage:
        "Layanan server AI sedang mengalami lonjakan beban sementara. Silakan coba analisis ulang dalam beberapa detik.",
      rawError: raw,
      statusCode: 503,
    };
  }

  if (
    raw.includes("fetch failed") ||
    raw.includes("ECONNREFUSED") ||
    raw.includes("timeout") ||
    raw.includes("ENOTFOUND")
  ) {
    return {
      userFriendlyMessage:
        "Koneksi jaringan ke server AI terputus. Pastikan perangkatmu terhubung ke internet.",
      rawError: raw,
      statusCode: 504,
    };
  }

  return {
    userFriendlyMessage:
      "Terjadi kendala teknis saat menghubungi layanan AI. Catatan dan pilihanmu tetap aman.",
    rawError: raw,
    statusCode: 500,
  };
}

/**
 * Checks whether an error is non-retryable across models.
 * Non-retryable errors (such as bad auth, client syntax errors, or project-level quota exhaustion)
 * will fail on all candidate models identically, so we must break immediately to prevent wasting quota.
 */
function isNonRetryableError(statusCode: number): boolean {
  return statusCode === 401 || statusCode === 403 || statusCode === 400 || statusCode === 429;
}

export async function generateStructuredAI<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  systemInstruction?: string
): Promise<{ data: T; modelUsed: string }> {
  const ai = getGenAIClient();
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction:
            systemInstruction ||
            "You are UNMASKED Reflective Assistant. Follow strict non-diagnostic, tentative, calm, and empathetic guidelines. Return only valid JSON.",
          responseMimeType: "application/json",
          temperature: 0.4,
          maxOutputTokens: 800,
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI model");

      // Extract JSON if model wrapped in markdown fences
      let cleaned = text.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const jsonParsed = JSON.parse(cleaned);
      const validated = schema.parse(jsonParsed);

      return {
        data: validated,
        modelUsed: model,
      };
    } catch (err) {
      lastError = err;
      const parsed = parseAIError(err);

      // Celah 1 Optimization: If the error is non-retryable (401, 403, 400, 429),
      // DO NOT loop through other candidate models to save quota and prevent rate-limit burning.
      if (isNonRetryableError(parsed.statusCode)) {
        console.warn(
          `[AI Client] Model ${model} encountered non-retryable error (HTTP ${parsed.statusCode}). Halting fallback loop to protect quota.`
        );
        break;
      }

      console.warn(`[AI Client] Model ${model} failed (HTTP ${parsed.statusCode}), trying next candidate...`);
    }
  }

  const parsed = parseAIError(lastError);
  const compositeError = new Error(parsed.userFriendlyMessage);
  (compositeError as unknown as { rawError: string; statusCode: number }).rawError = parsed.rawError;
  (compositeError as unknown as { rawError: string; statusCode: number }).statusCode = parsed.statusCode;
  throw compositeError;
}
