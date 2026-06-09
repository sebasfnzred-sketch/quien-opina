import Anthropic from "@anthropic-ai/sdk";
import type { Mention, Role, Stance, Platform } from "../types";
import type { RawMention } from "./newsapi";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ClassifiedFields {
  stance: Stance;
  role: Role;
  reachScore: number;
  credibilityScore: number;
  amplificationScore: number;
  narrativeTags: string[];
  connectedActors: string[];
}

const CLASSIFICATION_SCHEMA = {
  type: "object",
  properties: {
    classifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          stance: { type: "string", enum: ["favorable", "critical", "neutral", "ambiguous"] },
          role: {
            type: "string",
            enum: ["journalist", "founder", "researcher", "policymaker", "investor", "creator", "competitor", "academic", "analyst", "activist"],
          },
          reachScore: { type: "number", minimum: 0, maximum: 100 },
          credibilityScore: { type: "number", minimum: 0, maximum: 100 },
          amplificationScore: { type: "number", minimum: 0, maximum: 100 },
          narrativeTags: { type: "array", items: { type: "string" } },
          connectedActors: { type: "array", items: { type: "string" } },
        },
        required: ["id", "stance", "role", "reachScore", "credibilityScore", "amplificationScore", "narrativeTags", "connectedActors"],
      },
    },
  },
  required: ["classifications"],
} as const;

function buildPrompt(topic: string, mentions: RawMention[]): string {
  const mentionList = mentions
    .map(
      (m) =>
        `ID: ${m.id}\nSource: ${m.actor} (${m.platform})\nText: ${m.text}\n`
    )
    .join("\n---\n");

  return `You are an expert analyst of strategic actor intelligence. For each mention below about the topic "${topic}", classify:

- stance: how the source positions themselves toward the topic (favorable/critical/neutral/ambiguous)
- role: the actor's function in public conversation (journalist/founder/researcher/policymaker/investor/creator/competitor/academic/analyst/activist)
- reachScore (0-100): estimated audience reach (followers, readers, listeners)
- credibilityScore (0-100): perceived authority and expertise on this topic
- amplificationScore (0-100): likelihood their message gets amplified/reshared
- narrativeTags: 1-3 short thematic tags (e.g. "AI safety", "market competition", "regulation")
- connectedActors: names of people/orgs mentioned or cited in the text

Return a JSON object with a "classifications" array. Include one entry per mention ID.

Mentions:
${mentionList}`;
}

export async function classifyMentions(
  topic: string,
  rawMentions: RawMention[]
): Promise<Mention[]> {
  const BATCH_SIZE = 10;
  const results: Mention[] = [];

  for (let i = 0; i < rawMentions.length; i += BATCH_SIZE) {
    const batch = rawMentions.slice(i, i + BATCH_SIZE);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      tools: [
        {
          name: "classify_mentions",
          description: "Classify mentions with stance, role, and scores",
          input_schema: CLASSIFICATION_SCHEMA as unknown as Anthropic.Tool["input_schema"],
        },
      ],
      tool_choice: { type: "any" },
      messages: [
        {
          role: "user",
          content: buildPrompt(topic, batch),
        },
      ],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") continue;

    const parsed = toolUse.input as { classifications: Array<{ id: string } & ClassifiedFields> };

    for (const raw of batch) {
      const classified = parsed.classifications.find((c) => c.id === raw.id);
      if (!classified) continue;

      results.push({
        id: raw.id,
        actor: raw.actor,
        handle: raw.handle,
        platform: raw.platform as Platform,
        text: raw.text,
        date: raw.date,
        stance: classified.stance,
        role: classified.role,
        reachScore: Math.round(classified.reachScore),
        credibilityScore: Math.round(classified.credibilityScore),
        amplificationScore: Math.round(classified.amplificationScore),
        narrativeTags: classified.narrativeTags,
        connectedActors: classified.connectedActors,
      });
    }
  }

  return results;
}
