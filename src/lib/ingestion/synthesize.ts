import Anthropic from "@anthropic-ai/sdk";
import type { ExecutiveLayer, IntelligenceReport } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Capa ejecutiva: un solo llamado a Sonnet que recibe el reporte determinista
// ya calculado y lo traduce a decisión (brief, postura, recomendaciones por
// stakeholder). El modelo NUNCA calcula números: solo explica los del reporte.
// ─────────────────────────────────────────────────────────────────────────────

const STAKEHOLDERS = [
  "board",
  "ejecutivos",
  "empleados",
  "clientes",
  "reguladores",
  "medios",
] as const;

const EXECUTIVE_SCHEMA = {
  type: "object",
  properties: {
    brief: {
      type: "array",
      items: { type: "string" },
      minItems: 5,
      maxItems: 5,
      description:
        "Exactamente 5 bullets en este orden: qué está pasando / por qué importa / qué riesgo existe / qué oportunidad existe / qué hacer ahora.",
    },
    positioning: {
      type: "object",
      properties: {
        posture: { type: "string", enum: ["defensiva", "neutral", "proactiva"] },
        rationale: { type: "string" },
        firstMove: { type: "string" },
      },
      required: ["posture", "rationale", "firstMove"],
    },
    stakeholderRecs: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          stakeholder: { type: "string", enum: [...STAKEHOLDERS] },
          action: { type: "string" },
          rationale: { type: "string" },
        },
        required: ["stakeholder", "action", "rationale"],
      },
    },
  },
  required: ["brief", "positioning", "stakeholderRecs"],
} as const;

/**
 * Versión compacta del reporte para el prompt: solo lo que el juicio ejecutivo
 * necesita (~2-3K tokens), sin menciones crudas ni red de actores.
 */
function compactReport(report: IntelligenceReport) {
  return {
    topic: report.topic,
    riskScore: report.riskScore,
    opportunityScore: report.opportunityScore,
    narrativeMomentum: report.narrativeMomentum,
    totalMentions: report.totalMentions,
    totalActors: report.totalActors,
    executiveSummary: report.executiveSummary,
    stanceDistribution: report.stanceDistribution,
    topActors: report.topActors.slice(0, 8).map((a) => ({
      actor: a.actor,
      role: a.role,
      strategicWeight: a.strategicWeight,
      dominantStance: a.dominantStance,
      topNarratives: a.topNarratives,
      platforms: a.platforms,
    })),
    narratives: report.narratives.map((n) => ({
      tag: n.tag,
      weight: n.weight,
      momentum: n.momentum,
      dominantStance: n.dominantStance,
      topActors: n.topActors,
    })),
    warnings: report.warnings.map((w) => ({
      severity: w.severity,
      title: w.title,
      detail: w.detail,
    })),
  };
}

function buildPrompt(report: IntelligenceReport): string {
  return `Eres el jefe de gabinete de comunicación estratégica de la organización protagonista del tema "${report.topic}". Escribes para un CEO que tiene 60 segundos. Tu trabajo es convertir el reporte de inteligencia adjunto en una decisión, no en más análisis.

REGLA DE ORO: todos los números, actores y narrativas que menciones deben existir literalmente en el reporte adjunto. No inventes cifras, no inventes actores, no estimes datos nuevos. Si citas un score o un momentum, copia el valor exacto.

Genera tres bloques:

1. BRIEF — exactamente 5 bullets, en este orden:
   (1) qué está pasando, (2) por qué importa, (3) qué riesgo existe, (4) qué oportunidad existe, (5) qué hacer ahora.
   Máximo 30 palabras por bullet. Cada bullet debe nombrar al menos un actor o narrativa concreta del reporte. Puedes usar **negritas** para el dato clave de cada bullet.

2. POSITIONING — si la organización decide hablar públicamente de este tema, ¿qué postura adopta?
   Criterio: momentum positivo con narrativa disputada → proactiva (hay ventana para encuadrar). Riesgo alto con momentum negativo → neutral (no reavivar la conversación). Actor crítico de alto peso acelerando una narrativa → defensiva (contener antes de encuadrar).
   - rationale: por qué esa postura y no las otras dos, anclado en los scores y narrativas del reporte (máx. 60 palabras).
   - firstMove: la primera acción concreta, ejecutable en 24–48h por una persona con cargo identificable (máx. 30 palabras).

3. STAKEHOLDER RECS — una recomendación por audiencia, las 6: board, ejecutivos, empleados, clientes, reguladores, medios.
   - action: imperativo y concreto (máx. 25 palabras).
   - rationale: por qué, citando un actor, narrativa o score del reporte por nombre (máx. 30 palabras).
   PROHIBIDO el consejo genérico ("comunicar con transparencia", "monitorear la situación"). Si la recomendación sirve para cualquier empresa en cualquier crisis, está mal.

Escribe todo en español, aunque los datos vengan en inglés.

REPORTE:
${JSON.stringify(compactReport(report), null, 1)}`;
}

/**
 * Genera la capa ejecutiva a partir del reporte. Devuelve null ante cualquier
 * error (sin API key, timeout, respuesta malformada): el análisis nunca debe
 * fallar por culpa de la síntesis.
 */
export async function synthesizeExecutiveLayer(
  report: IntelligenceReport,
): Promise<ExecutiveLayer | null> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return null;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      tools: [
        {
          name: "deliver_executive_layer",
          description:
            "Entrega el brief ejecutivo, la postura recomendada y las recomendaciones por stakeholder",
          input_schema: EXECUTIVE_SCHEMA as unknown as Anthropic.Tool["input_schema"],
        },
      ],
      tool_choice: { type: "any" },
      messages: [{ role: "user", content: buildPrompt(report) }],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return null;

    const layer = toolUse.input as ExecutiveLayer;

    // Validación mínima: estructura presente y las 6 audiencias cubiertas.
    if (!Array.isArray(layer.brief) || layer.brief.length === 0) return null;
    if (!layer.positioning?.posture) return null;
    const covered = new Set(layer.stakeholderRecs?.map((r) => r.stakeholder));
    if (covered.size < STAKEHOLDERS.length) return null;

    return layer;
  } catch (err) {
    console.error(
      "[synthesizeExecutiveLayer]",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
