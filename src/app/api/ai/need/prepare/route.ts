import { NextResponse } from "next/server";
import { generateStructuredAI } from "@/lib/ai/client";
import { buildNeedPreparePrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { NeedPrepareOutputSchema } from "@/schemas/reflection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { loadThemes, loadSummary, userCorrection, maskConfirmed } = body;

    const prompt = buildNeedPreparePrompt({
      loadThemes: loadThemes || ["Tekanan Tugas & Ekspektasi"],
      loadSummary: loadSummary || "Pengguna merasa banyak hal yang harus diselesaikan sekaligus.",
      userCorrection,
      maskConfirmed,
    });

    const { data } = await generateStructuredAI(
      prompt,
      NeedPrepareOutputSchema,
      SYSTEM_GUIDELINES
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in /api/ai/need/prepare:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
