import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildNeedSynthesizePrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { NeedSynthesizeInputSchema, NeedInsightSchema } from "@/schemas/reflection";
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

    const parseResult = NeedSynthesizeInputSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Input sintesis NEED tidak valid.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { candidates, questions, answers, loadContext, maskContext } = parseResult.data;

    // Safety Pipeline Check pada jawaban pengguna (Safety v2 AI-First with Fallback)
    const userText = answers.map((a) => a.answer).filter(Boolean).join("\n");

    const safetyDecision = await assessSafety({
      stage: "need_synthesize",
      userText,
      contextualData: JSON.stringify({
        loadContext,
        maskContext,
      }),
    });

    if (safetyDecision.action === "intervene") {
      return createSafetyInterventionResponse(safetyDecision.assessment);
    }

    const prompt = buildNeedSynthesizePrompt({
      maskContext,
      loadContext: {
        themes: loadContext?.themes || [],
        summary: loadContext?.summary || "",
        userCorrection: loadContext?.userCorrection,
      },
      candidates,
      questions,
      answers,
    });

    const { data, modelUsed } = await generateStructuredAI(
      prompt,
      NeedInsightSchema,
      {
        task: "needSynthesize",
        systemInstruction: SYSTEM_GUIDELINES,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        meta: {
          model: modelUsed,
          promptVersion: "need-synthesis-v2",
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/need/synthesize:", error);
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
