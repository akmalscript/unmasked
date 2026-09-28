import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildNeedPreparePrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { NeedPrepareInputSchema, NeedPrepareOutputSchema } from "@/schemas/reflection";
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

    const parseResult = NeedPrepareInputSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Input NEED prepare tidak valid. Konteks LOAD wajib diisi.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { maskContext, loadContext } = parseResult.data;

    // Safety Pipeline Check
    const safetyCheck = checkCrisisRisk(`${loadContext.summary} ${loadContext.userCorrection || ""}`);
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

    const prompt = buildNeedPreparePrompt({
      maskContext,
      loadContext,
    });

    const { data, modelUsed } = await generateStructuredAI(
      prompt,
      NeedPrepareOutputSchema,
      SYSTEM_GUIDELINES
    );

    // Pastikan pertanyaan berakhiran tanda tanya dan tetap bersih
    const validatedQuestions = data.questions.map((q) => {
      let cleaned = q.question.trim();
      if (!cleaned.endsWith("?")) {
        cleaned += "?";
      }
      return {
        ...q,
        question: cleaned,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        questions: validatedQuestions,
        meta: {
          model: modelUsed,
          promptVersion: "need-prepare-v2",
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/need/prepare:", error);
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
