import { NextRequest, NextResponse } from "next/server";
import { fetchRawArticles, convertArticle } from "@/lib/ingestion/newsapi";
import { filterRelevantArticles } from "@/lib/ingestion/relevance";
import { classifyMentions } from "@/lib/ingestion/classify";
import { synthesizeExecutiveLayer } from "@/lib/ingestion/synthesize";
import { saveMentions, getMentionsForTopic, saveReportSnapshot } from "@/lib/db";
import { generateReport } from "@/lib/analysis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic: string = (body.topic ?? "").trim();

    if (!topic) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    // 1. Fetch raw articles from NewsAPI
    const rawArticles = await fetchRawArticles(topic, 20);

    // 2. Filter: topic must appear in title or description
    const { relevant, stats } = filterRelevantArticles(topic, rawArticles);
    console.log(
      `[analyze] relevance: ${stats.totalFetched} fetched → ${stats.totalRelevant} relevant, ${stats.totalDiscarded} discarded`,
      stats.topDiscardReasons.length ? `| top reason: "${stats.topDiscardReasons[0].reason}" (${stats.topDiscardReasons[0].count})` : "",
    );

    // 3. Convert filtered articles to RawMentions for classification
    const rawMentions = relevant.map((a, i) => convertArticle(a, i));

    // 4. Classify with Claude Haiku
    const freshMentions = await classifyMentions(topic, rawMentions);

    // 5. Persist new mentions
    if (freshMentions.length > 0) {
      await saveMentions(topic, freshMentions);
    }

    // 6. Load all mentions for the topic (fresh + historical)
    const allMentions = await getMentionsForTopic(topic);

    // Fall back to just the fresh batch if DB is empty (e.g. first run before setup)
    const mentions = allMentions.length > 0 ? allMentions : freshMentions;

    if (mentions.length === 0) {
      return NextResponse.json(
        { error: "No mentions found for this topic" },
        { status: 404 },
      );
    }

    // 7. Run the analytics engine
    const report = generateReport(mentions, topic, new Date());

    // 8. Executive layer (Sonnet). Null on failure — never blocks the report.
    report.executive = (await synthesizeExecutiveLayer(report)) ?? undefined;

    // 9. Persist snapshot
    await saveReportSnapshot(report);

    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[/api/analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
