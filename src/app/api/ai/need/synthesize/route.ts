import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildNeedSynthesizePrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { NeedSynthesizeInputSchema, NeedInsightSchema } from "@/schemas/reflection";
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

    // Safety Pipeline Check pada jawaban pengguna
    const answersText = answers.map((a) => a.answer).join(" ");
    const safetyCheck = checkCrisisRisk(answersText);
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
      SYSTEM_GUIDELINES
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
