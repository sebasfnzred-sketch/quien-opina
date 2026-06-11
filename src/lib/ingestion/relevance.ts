import type { NewsApiArticle } from "./newsapi";

export interface DiscardedArticle {
  title: string;
  source: string;
  reason: string;
}

export interface RelevanceResult {
  relevant: NewsApiArticle[];
  discarded: DiscardedArticle[];
  stats: {
    totalFetched: number;
    totalRelevant: number;
    totalDiscarded: number;
    topDiscardReasons: { reason: string; count: number }[];
  };
}

// Known Spanish topic → English equivalents.
// Each entry: [regex to match against the topic, additional search terms].
const EQUIVALENTS: [pattern: RegExp, terms: string[]][] = [
  [
    /copa\s+mundial(\s+2026)?/i,
    ["world cup 2026", "fifa world cup 2026", "2026 world cup", "world cup"],
  ],
  [/mundial(\s+2026)?/i, ["world cup 2026", "world cup"]],
  [/inteligencia\s+artificial/i, ["artificial intelligence"]],
  [/cambio\s+clim[aá]tico/i, ["climate change"]],
  [/elecciones?/i, ["election", "elections"]],
  [/banco\s+central/i, ["central bank"]],
];

function buildSearchTerms(topic: string): string[] {
  const lower = topic.toLowerCase().trim();
  const terms = new Set<string>([lower]);

  for (const [pattern, equiv] of EQUIVALENTS) {
    if (pattern.test(lower)) {
      equiv.forEach((e) => terms.add(e.toLowerCase()));
    }
  }

  return Array.from(terms);
}

function containsAny(text: string | null | undefined, terms: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t));
}

export function filterRelevantArticles(
  topic: string,
  articles: NewsApiArticle[],
): RelevanceResult {
  const terms = buildSearchTerms(topic);
  const relevant: NewsApiArticle[] = [];
  const discarded: DiscardedArticle[] = [];
  const reasonCounts = new Map<string, number>();

  const bump = (reason: string) =>
    reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);

  for (const article of articles) {
    const inTitle = containsAny(article.title, terms);
    const inDescription = containsAny(article.description, terms);
    const inContent = containsAny(article.content, terms);

    if (inTitle || inDescription) {
      relevant.push(article);
    } else {
      const reason = inContent
        ? "topic only in content body (tangential)"
        : "topic absent from title and description";
      discarded.push({ title: article.title ?? "", source: article.source.name, reason });
      bump(reason);
    }
  }

  // Safety fallback: if every article was discarded, promote the "content-only" ones
  // rather than sending 0 articles to the classifier.
  let finalRelevant = relevant;
  if (relevant.length === 0 && articles.length > 0) {
    finalRelevant = articles;
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[relevance] ⚠️  0 articles passed the filter for "${topic}" — falling back to all ${articles.length} fetched.`,
      );
    }
  }

  const topDiscardReasons = Array.from(reasonCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ reason, count }));

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[relevance] topic="${topic}" | terms: ${terms.join(", ")}`,
    );
    console.log(
      `[relevance] fetched=${articles.length} | relevant=${finalRelevant.length} | discarded=${discarded.length}`,
    );
    if (discarded.length > 0) {
      console.log("[relevance] top discard reasons:", topDiscardReasons);
      console.log("[relevance] discarded examples:");
      discarded.slice(0, 5).forEach((d) =>
        console.log(`  [${d.reason}] "${d.title.slice(0, 80)}" — ${d.source}`),
      );
    }
  }

  return {
    relevant: finalRelevant,
    discarded,
    stats: {
      totalFetched: articles.length,
      totalRelevant: finalRelevant.length,
      totalDiscarded: discarded.length,
      topDiscardReasons,
    },
  };
}
