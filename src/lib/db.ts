import { getInsForge } from "./insforge";
import type { Mention, Role, Stance, Platform } from "./types";
import type { IntelligenceReport } from "./types";

// ── Mentions ─────────────────────────────────────────────────────────────────

interface MentionRow {
  id: string;
  topic: string;
  actor: string;
  handle: string | null;
  role: Role;
  platform: Platform;
  text: string;
  stance: Stance;
  reach_score: number;
  credibility_score: number;
  amplification_score: number;
  date: string;
  connected_actors: string[] | null;
  narrative_tags: string[] | null;
}

export async function saveMentions(topic: string, mentions: Mention[]): Promise<void> {
  if (mentions.length === 0) return;

  const db = getInsForge().database;

  // Fetch existing IDs for this topic to skip duplicates (SDK has no upsert).
  const { data: existing } = await db
    .from("mentions")
    .select("id")
    .eq("topic", topic)
    .in("id", mentions.map((m) => m.id));

  const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id));
  const newMentions = mentions.filter((m) => !existingIds.has(m.id));

  if (newMentions.length === 0) return;

  const rows = newMentions.map((m) => ({
    id: m.id,
    topic,
    actor: m.actor,
    handle: m.handle ?? null,
    role: m.role,
    platform: m.platform,
    text: m.text,
    stance: m.stance,
    reach_score: m.reachScore,
    credibility_score: m.credibilityScore,
    amplification_score: m.amplificationScore,
    date: m.date,
    connected_actors: m.connectedActors,
    narrative_tags: m.narrativeTags,
  }));

  const { error } = await db.from("mentions").insert(rows);
  if (error) throw new Error(`saveMentions failed: ${error.message}`);
}

export async function getMentionsForTopic(topic: string): Promise<Mention[]> {
  const { data, error } = await getInsForge()
    .database
    .from("mentions")
    .select("id, actor, handle, role, platform, text, stance, reach_score, credibility_score, amplification_score, date, connected_actors, narrative_tags")
    .eq("topic", topic)
    .order("date", { ascending: false })
    .limit(200);

  if (error) throw new Error(`getMentionsForTopic failed: ${error.message}`);

  return ((data ?? []) as MentionRow[]).map((row) => ({
    id: row.id,
    actor: row.actor,
    handle: row.handle ?? undefined,
    role: row.role,
    platform: row.platform,
    text: row.text,
    stance: row.stance,
    reachScore: row.reach_score,
    credibilityScore: row.credibility_score,
    amplificationScore: row.amplification_score,
    date: row.date,
    connectedActors: row.connected_actors ?? [],
    narrativeTags: row.narrative_tags ?? [],
  }));
}

// ── Report snapshots ──────────────────────────────────────────────────────────

export async function saveReportSnapshot(report: IntelligenceReport): Promise<void> {
  const { error } = await getInsForge().database.from("report_snapshots").insert([{
    topic: report.topic,
    generated_at: report.generatedAt,
    report,
    mention_count: report.totalMentions,
  }]);

  if (error) throw new Error(`saveReportSnapshot failed: ${error.message}`);
}
