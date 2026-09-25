import { NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";
import { buildActionPrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { ActionOutputSchema } from "@/schemas/reflection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { primaryNeed, loadSummary, loadThemes, maskContext, needCorrection } = body;

    if (!primaryNeed) {
      return NextResponse.json(
        { error: "primaryNeed is required" },
        { status: 400 }
      );
    }

    const prompt = buildActionPrompt({
      maskContext,
      primaryNeed,
      loadSummary: loadSummary || "Kewalahan dengan beberapa tuntutan.",
      loadThemes: loadThemes || ["Tekanan tugas"],
      needCorrection,
    });

    const { data } = await generateStructuredAI(
      prompt,
      ActionOutputSchema,
      SYSTEM_GUIDELINES
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in /api/ai/action:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
