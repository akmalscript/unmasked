import { NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";
import { buildNeedSynthesizePrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { NeedInsightSchema } from "@/schemas/reflection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { maskContext, loadContext, candidates, questions, answers, loadSummary } = body;

    if (!candidates || !questions || !answers) {
      return NextResponse.json(
        { error: "candidates, questions, and answers are required" },
        { status: 400 }
      );
    }

    const resolvedLoadContext = loadContext || {
      themes: [],
      summary: loadSummary || "",
    };

    const prompt = buildNeedSynthesizePrompt({
      maskContext,
      loadContext: resolvedLoadContext,
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
