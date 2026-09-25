import { NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";
import { buildMaskPrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { MaskInsightSchema } from "@/schemas/reflection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { publicTags, actualFeelings, note } = body;

    if (!publicTags || !Array.isArray(publicTags) || publicTags.length === 0) {
      return NextResponse.json(
        { error: "publicTags is required and must not be empty" },
        { status: 400 }
      );
    }
    if (!actualFeelings || !Array.isArray(actualFeelings) || actualFeelings.length === 0) {
      return NextResponse.json(
        { error: "actualFeelings is required and must not be empty" },
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
          promptVersion: "mask-v1",
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/mask:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
