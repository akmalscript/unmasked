import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildLoadPrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { LoadInsightSchema } from "@/schemas/reflection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brainDump, items, maskContext } = body;

    if (!brainDump || typeof brainDump !== "string" || brainDump.trim().length === 0) {
      return NextResponse.json(
        { error: "brainDump is required and must not be empty" },
        { status: 400 }
      );
    }

    // Defensive safeguard: ensure brainDump does not exceed 2000 characters
    const sanitizedBrainDump = brainDump.trim().slice(0, 2000);

    const prompt = buildLoadPrompt({ brainDump: sanitizedBrainDump, items, maskContext });
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
          promptVersion: "load-v1",
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
        error: parsed.userFriendlyMessage,
        technicalError: parsed.rawError,
      },
      { status: parsed.statusCode }
    );
  }
}
