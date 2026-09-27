import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildMaskPrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { MaskInputSchema, MaskInsightSchema } from "@/schemas/reflection";
import { checkCrisisRisk } from "@/lib/safety/crisisKeywords";
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

    // Safety Pipeline Check
    const safetyCheck = checkCrisisRisk(`${actualFeelings.join(" ")} ${note || ""}`);
    if (safetyCheck.isCrisis) {
      return NextResponse.json(
        {
          success: false,
          code: "SAFETY_INTERVENTION",
          message: "Kami mendeteksi situasi yang membutuhkan pendampingan krisis. Keselamatanmu adalah hal paling utama.",
          riskLevel: "high",
          emergencyContacts: safetyCheck.emergencyContacts,
          retryable: false,
        },
        { status: 400 }
      );
    }

    const prompt = buildMaskPrompt({ publicTags, actualFeelings, note });
    const { data, modelUsed } = await generateStructuredAI(
      prompt,
      MaskInsightSchema,
      SYSTEM_GUIDELINES
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
