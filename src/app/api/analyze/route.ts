import { NextRequest, NextResponse } from "next/server";
import { fetchNewsArticles } from "@/lib/ingestion/newsapi";
import { classifyMentions } from "@/lib/ingestion/classify";
import { saveMentions, getMentionsForTopic, saveReportSnapshot } from "@/lib/db";
import { generateReport } from "@/lib/analysis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic: string = (body.topic ?? "").trim();

    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    // 1. Fetch fresh articles from NewsAPI
    const rawMentions = await fetchNewsArticles(topic, 20);

    // 2. Classify with Claude API
    const freshMentions = await classifyMentions(topic, rawMentions);

    // 3. Persist new mentions
    if (freshMentions.length > 0) {
      await saveMentions(topic, freshMentions);
    }

    // 4. Load all mentions for the topic (fresh + historical)
    const allMentions = await getMentionsForTopic(topic);

    // Fall back to just the fresh batch if DB is empty (e.g. first run before setup)
    const mentions = allMentions.length > 0 ? allMentions : freshMentions;

    if (mentions.length === 0) {
      return NextResponse.json(
        { error: "No mentions found for this topic" },
        { status: 404 }
      );
    }

    // 5. Run the analytics engine
    const report = generateReport(mentions, topic, new Date());

    // 6. Persist snapshot
    await saveReportSnapshot(report);

    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[/api/analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
