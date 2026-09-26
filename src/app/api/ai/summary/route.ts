import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildSummaryPrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { SummaryOutputSchema } from "@/schemas/reflection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { whatYouShow, whatYouCarry, whatYouMayNeed, selectedActionTitle, selectedActionDesc } = body;

    const prompt = buildSummaryPrompt({
      whatYouShow: whatYouShow || ["Produktif", "Kuat"],
      whatYouCarry: whatYouCarry || ["Academic Pressure"],
      whatYouMayNeed: whatYouMayNeed || ["Rasa Kendali"],
      selectedActionTitle: selectedActionTitle || "Langkah Kecil",
      selectedActionDesc: selectedActionDesc || "Luangkan 10 menit jeda.",
    });

    const { data, modelUsed } = await generateStructuredAI(
      prompt,
      SummaryOutputSchema,
      SYSTEM_GUIDELINES
    );

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        meta: {
          model: modelUsed,
          promptVersion: "summary-v1",
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/summary:", error);
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
