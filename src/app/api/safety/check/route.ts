import { NextResponse } from "next/server";
import { checkCrisisRisk } from "@/lib/safety/crisisKeywords";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, contents } = body;

    const combinedText = [
      text,
      Array.isArray(contents) ? contents.join(" ") : "",
    ].filter(Boolean).join(" ");

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
      { error: "Gagal memeriksa safety" },
      { status: 500 }
    );
  }
}
