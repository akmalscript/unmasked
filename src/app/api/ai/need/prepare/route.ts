import { NextResponse } from "next/server";
import { generateStructuredAI, parseAIError } from "@/lib/ai/client";
import { buildNeedPreparePrompt, SYSTEM_GUIDELINES } from "@/lib/ai/prompts";
import { NeedPrepareOutputSchema } from "@/schemas/reflection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { maskContext, loadContext, loadThemes, loadSummary, userCorrection } = body;

    const resolvedLoadContext = loadContext || {
      themes: loadThemes || ["Tuntutan Tugas & Waktu"],
      summary: loadSummary || "Pengguna merasa banyak hal yang harus diselesaikan sekaligus.",
      userCorrection,
    };

    const prompt = buildNeedPreparePrompt({
      maskContext,
      loadContext: resolvedLoadContext,
    });

    const { data } = await generateStructuredAI(
      prompt,
      NeedPrepareOutputSchema,
      SYSTEM_GUIDELINES
    );

    // Question Quality Safeguard (Bab 36):
    // Ensure all questions end with '?', are between 2-3 questions, and not overly long.
    const validatedQuestions = data.questions.slice(0, 3).map((q) => {
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
      },
    });
  } catch (error) {
    console.error("Error in /api/ai/need/prepare:", error);
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
