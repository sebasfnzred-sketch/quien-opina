import { createHash } from "crypto";
import type { Mention, Platform } from "../types";

const NEWSAPI_BASE = "https://newsapi.org/v2";

export interface NewsApiArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
  author: string | null;
}

interface NewsApiResponse {
  status: string;
  articles: NewsApiArticle[];
  message?: string;
}

export function convertArticle(
  article: NewsApiArticle,
  _index: number,
): Omit<Mention, "stance" | "role" | "reachScore" | "credibilityScore" | "amplificationScore" | "connectedActors" | "narrativeTags"> & {
  sourceUrl: string;
} {
  const text = [article.title, article.description, article.content]
    .filter(Boolean)
    .join(" ")
    .slice(0, 500);

  const actor = article.author ?? article.source.name;
  const handle = article.source.name.toLowerCase().replace(/\s+/g, "-");

  return {
    id: `news-${createHash("sha1").update(article.url).digest("hex").slice(0, 16)}`,
    actor,
    handle,
    platform: "Press" as Platform,
    text,
    date: article.publishedAt,
    sourceUrl: article.url,
  };
}

export type RawMention = ReturnType<typeof convertArticle>;

export async function fetchRawArticles(topic: string, pageSize = 20): Promise<NewsApiArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) throw new Error("NEWSAPI_KEY not set");

  const params = new URLSearchParams({
    q: topic,
    language: "en",
    sortBy: "publishedAt",
    pageSize: String(pageSize),
    apiKey,
  });

  const res = await fetch(`${NEWSAPI_BASE}/everything?${params}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`NewsAPI error: ${res.status} ${res.statusText}`);
  }

  const data: NewsApiResponse = await res.json();

  if (data.status !== "ok") {
    throw new Error(`NewsAPI returned error: ${data.message ?? "unknown"}`);
  }

  return data.articles.filter((a) => a.title && (a.description || a.content));
}

// Kept for backwards compatibility (used by classify.ts indirectly via route.ts)
export async function fetchNewsArticles(topic: string, pageSize = 20): Promise<RawMention[]> {
  const articles = await fetchRawArticles(topic, pageSize);
  return articles.map((a, i) => convertArticle(a, i));
}
