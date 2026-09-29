import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildMaskPrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { MaskInputSchema, MaskInsightSchema } from "@/schemas/reflection";
import { assessSafety } from "@/lib/safety/assess";
import { createSafetyInterventionResponse } from "@/lib/safety/interventionResponse";
import { checkRateLimit, getClientIdentifiers, validateBodySize } from "@/lib/ai/rateLimit";

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

    const { ipKey, sessionKey } = getClientIdentifiers(req);

    const ipLimit = checkRateLimit(ipKey, {
      maxRequestsPerMinute: 60,
      cooldownMs: 1000,
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
      maxRequestsPerMinute: 15,
      cooldownMs: 1200,
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

    const parseResult = MaskInputSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Input MASK tidak valid.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { publicTags, actualFeelings, note } = parseResult.data;

    // Safety Pipeline Check (Safety v2 AI-First with Fallback)
    const userText = [
      ...actualFeelings,
      note || "",
    ].filter(Boolean).join("\n");

    const safetyDecision = await assessSafety({
      stage: "mask",
      userText,
      contextualData: publicTags.join(", "),
    });

    if (safetyDecision.action === "intervene") {
      return createSafetyInterventionResponse(safetyDecision.assessment);
    }

    const prompt = buildMaskPrompt({ publicTags, actualFeelings, note });
    const { data, modelUsed } = await generateStructuredAI(
      prompt,
      MaskInsightSchema,
      {
        task: "mask",
        systemInstruction: SYSTEM_GUIDELINES,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        meta: {
          model: modelUsed,
          promptVersion: "mask-v2",
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/mask:", error);
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
