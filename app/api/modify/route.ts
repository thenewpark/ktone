export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { KToneTool } from "@/lib/ktone/tools/KToneTool";

export async function POST(req: NextRequest) {
  try {
    const { text, style, formality } = await req.json();
    if (!text || !style || !formality) {
      return NextResponse.json({ error: "text, style, formality are required" }, { status: 400 });
    }
    const tool = new KToneTool();
    const result = await tool.execute({
      apiKey: process.env.OPENAI_API_KEY,
      text,
      mode: "rewrite",
      style: String(style),
      formality: String(formality),
    });
    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
