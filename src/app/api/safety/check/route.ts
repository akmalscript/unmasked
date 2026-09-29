import { NextResponse } from "next/server";
import { z } from "zod";
import { assessSafety } from "@/lib/safety/assess";
import { checkRateLimit, getClientIdentifiers, validateBodySize } from "@/lib/ai/rateLimit";

const SafetyInputSchema = z.object({
  text: z.string().max(5000).optional(),
  contents: z
    .array(z.string().max(2000))
    .max(20)
    .optional(),
});

/**
 * Endpoint pemeriksaan keselamatan terpadu (Safety v2).
 * Berbagi engine analisis dan kebijakan anti-false-positive yang sama dengan semua rute AI.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    if (!validateBodySize(rawBody, 20 * 1024)) {
      return NextResponse.json(
        {
          success: false,
          code: "REQUEST_TOO_LARGE",
          message: "Ukuran request terlalu besar.",
          retryable: false,
        },
        { status: 413 }
      );
    }

    const { ipKey, sessionKey } = getClientIdentifiers(req);

    const ipLimit = checkRateLimit(ipKey, {
      maxRequestsPerMinute: 60,
      cooldownMs: 500,
    });
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: ipLimit.code || "RATE_LIMIT_EXCEEDED",
          message: ipLimit.message,
          retryAfterSeconds: ipLimit.retryAfterSeconds,
          retryable: true,
        },
        { status: 429 }
      );
    }

    const sessionLimit = checkRateLimit(sessionKey, {
      maxRequestsPerMinute: 30,
      cooldownMs: 800,
    });
    if (!sessionLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: sessionLimit.code || "RATE_LIMIT_EXCEEDED",
          message: sessionLimit.message,
          retryAfterSeconds: sessionLimit.retryAfterSeconds,
          retryable: true,
        },
        { status: 429 }
      );
    }

    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: "MALFORMED_JSON",
          message: "Format JSON tidak valid.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const parsed = SafetyInputSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Input safety tidak valid.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { text, contents } = parsed.data;
    const combinedText = [
      text || "",
      Array.isArray(contents) ? contents.join(" ") : "",
    ]
      .filter(Boolean)
      .join(" ");

    const safetyDecision = await assessSafety({
      stage: "general",
      userText: combinedText,
    });

    return NextResponse.json({
      success: true,
      safe: safetyDecision.action === "allow",
      action: safetyDecision.action,
      riskLevel: safetyDecision.assessment.riskLevel,
      assessment: safetyDecision.assessment,
    });
  } catch (error) {
    console.error("Error in /api/safety/check:", error);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Gagal memeriksa safety.",
        retryable: false,
      },
      { status: 500 }
    );
  }
}
