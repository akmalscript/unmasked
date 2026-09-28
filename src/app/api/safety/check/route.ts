import { NextResponse } from "next/server";
import { z } from "zod";
import { checkCrisisRisk } from "@/lib/safety/crisisKeywords";
import { validateBodySize } from "@/lib/ai/rateLimit";

const SafetyInputSchema = z.object({
  text: z.string().max(5000).optional(),
  contents: z
    .array(z.string().max(2000))
    .max(20)
    .optional(),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    if (!validateBodySize(rawBody, 20 * 1024)) {
      return NextResponse.json(
        {
          success: false,
          code: "REQUEST_TOO_LARGE",
          message: "Ukuran request terlalu besar.",
          retryable: false,
        },
        { status: 413 }
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

    const parsed = SafetyInputSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Input safety tidak valid.",
          retryable: false,
        },
        { status: 400 }
      );
    }

    const { text, contents } = parsed.data;
    const combinedText = [
      text || "",
      Array.isArray(contents) ? contents.join(" ") : "",
    ]
      .filter(Boolean)
      .join(" ");

    const result = checkCrisisRisk(combinedText);

    return NextResponse.json({
      success: true,
      safe: !result.isCrisis,
      riskLevel: result.isCrisis ? "high" : "low",
      data: result,
    });
  } catch (error) {
    console.error("Error in /api/safety/check:", error);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Gagal memeriksa safety.",
        retryable: false,
      },
      { status: 500 }
    );
  }
}
