import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildLoadPrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { LoadInputSchema, LoadInsightSchema } from "@/schemas/reflection";
import { checkCrisisRisk } from "@/lib/safety/crisisKeywords";
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

    const parseResult = LoadInputSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Input LOAD tidak valid.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { brainDump, items, maskContext } = parseResult.data;

    // Safety Pipeline Check
    const itemTexts = items ? items.map((i) => i.text).join(" ") : "";
    const safetyCheck = checkCrisisRisk(`${brainDump} ${itemTexts}`);
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

    const prompt = buildLoadPrompt({ brainDump, items, maskContext });
    const { data, modelUsed } = await generateStructuredAI(
      prompt,
      LoadInsightSchema,
      SYSTEM_GUIDELINES
    );

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        meta: {
          model: modelUsed,
          promptVersion: "load-v2",
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/load:", error);
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
