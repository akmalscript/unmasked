import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6K-1vHvcoNUA29VDbsIUZOPvOW6b1OZjVmJKDKe-SqN8Q";
const ai = new GoogleGenAI({ apiKey: API_KEY });

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest"
];

export async function generateStructuredAI<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  systemInstruction?: string
): Promise<{ data: T; modelUsed: string }> {
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are UNMASKED Reflective Assistant. Follow strict non-diagnostic, tentative, calm, and empathetic guidelines. Return only valid JSON.",
          responseMimeType: "application/json",
          temperature: 0.4,
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
      console.warn(`Model ${model} failed, trying next candidate... Error:`, err);
      lastError = err;
    }
  }

  throw new Error(`All AI models failed to generate valid structured response. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}
