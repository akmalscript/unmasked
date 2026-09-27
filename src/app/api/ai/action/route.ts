import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildActionPrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { ActionInputSchema, ActionOutputSchema } from "@/schemas/reflection";
import { checkRateLimit, getClientIdentifier, validateBodySize } from "@/lib/ai/rateLimit";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (!validateBodySize(rawBody)) {
      return NextResponse.json(
        {
          success: false,
          code: "REQUEST_TOO_LARGE",
          message: "Ukuran request melebihi batas maksimal yang diizinkan.",
          retryable: false,
        },
        { status: 413 }
      );
    }

    const clientId = getClientIdentifier(req);
    const rateCheck = checkRateLimit(clientId, { maxRequestsPerMinute: 15, cooldownMs: 1200 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: rateCheck.code || "RATE_LIMIT_EXCEEDED",
          message: rateCheck.message,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
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

    const parseResult = ActionInputSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Input langkah aksi tidak valid. Kebutuhan dan beban wajib diisi.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { primaryNeed, loadSummary, loadThemes, maskContext, needCorrection } = parseResult.data;

    const prompt = buildActionPrompt({
      maskContext,
      primaryNeed,
      loadSummary,
      loadThemes,
      needCorrection,
    });

    const { data, modelUsed } = await generateStructuredAI(
      prompt,
      ActionOutputSchema,
      SYSTEM_GUIDELINES
    );

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        meta: {
          model: modelUsed,
          promptVersion: "action-v2",
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/action:", error);
    const parsed = parseAIError(error);
    return NextResponse.json(
      {
        success: false,
        code: parsed.code,
        message: parsed.message,
        retryable: parsed.retryable,
      },
      { status: parsed.statusCode }
    );
  }
}
