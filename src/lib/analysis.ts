import type {
  ActorProfile,
  EarlyWarning,
  IntelligenceReport,
  Mention,
  NarrativeInsight,
  NetworkLink,
  NetworkNode,
  Recommendation,
  Stance,
  StanceDistribution,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Motor de inteligencia de QuiénOpina.
//
// La idea central: NO contamos volumen. Ponderamos *peso estratégico*.
// Un tuit de un fundador con alta credibilidad pesa más que 100 menciones
// anónimas. A partir de ese peso derivamos actores, narrativas, riesgo,
// oportunidad y recomendaciones ejecutivas.
// ─────────────────────────────────────────────────────────────────────────────

const STANCES: Stance[] = ["favorable", "critical", "neutral", "ambiguous"];

/** Ventana (días) que define "reciente" para el cálculo de momentum. */
const RECENT_WINDOW_DAYS = 7;

const emptyStanceRecord = (): Record<Stance, number> => ({
  favorable: 0,
  critical: 0,
  neutral: 0,
  ambiguous: 0,
});

const round = (n: number, d = 0): number => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

const clamp = (n: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, n));

const uniq = <T,>(arr: T[]): T[] => Array.from(new Set(arr));

/**
 * Peso estratégico de UNA mención (0–100).
 * Combinación ponderada: la credibilidad pesa más que el alcance crudo,
 * porque un actor creíble mueve la narrativa aunque tenga menos audiencia.
 */
export function strategicWeight(m: Mention): number {
  const w =
    0.34 * m.reachScore +
    0.4 * m.credibilityScore +
    0.26 * m.amplificationScore;
  return round(clamp(w), 1);
}

/** Postura dominante dado un conteo por postura (desempata por prioridad de señal). */
function dominantStance(breakdown: Record<Stance, number>): Stance {
  const priority: Stance[] = ["critical", "favorable", "ambiguous", "neutral"];
  let best: Stance = "neutral";
  let bestCount = -1;
  for (const s of STANCES) {
    const c = breakdown[s];
    if (c > bestCount || (c === bestCount && priority.indexOf(s) < priority.indexOf(best))) {
      best = s;
      bestCount = c;
    }
  }
  return best;
}

/** Días entre dos fechas ISO (a − b). */
function daysBetween(a: string, b: string): number {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

// ── Agregación por actor ─────────────────────────────────────────────────────

function buildActorProfiles(mentions: Mention[]): ActorProfile[] {
  const byActor = new Map<string, Mention[]>();
  for (const m of mentions) {
    const list = byActor.get(m.actor) ?? [];
    list.push(m);
    byActor.set(m.actor, list);
  }

  const profiles: ActorProfile[] = [];
  for (const [actor, list] of byActor) {
    const breakdown = emptyStanceRecord();
    let weightSum = 0;
    let reach = 0;
    let cred = 0;
    let amp = 0;
    const connections: string[] = [];
    const narratives: string[] = [];
    const platforms = uniq(list.map((m) => m.platform));

    for (const m of list) {
      breakdown[m.stance] += 1;
      weightSum += strategicWeight(m);
      reach += m.reachScore;
      cred += m.credibilityScore;
      amp += m.amplificationScore;
      // Evitamos autoconexiones que aparecen en el dataset semilla.
      connections.push(...m.connectedActors.filter((c) => c !== actor));
      narratives.push(...m.narrativeTags);
    }

    const n = list.length;
    // Peso del actor: promedio de pesos + bonus logarítmico por persistencia
    // (aparecer varias veces refuerza, pero no linealmente).
    const persistenceBonus = Math.log2(n + 1) * 4;
    const strategic = round(clamp(weightSum / n + persistenceBonus), 1);

    profiles.push({
      actor,
      handle: list[0].handle,
      role: list[0].role,
      strategicWeight: strategic,
      mentions: n,
      dominantStance: dominantStance(breakdown),
      stanceBreakdown: breakdown,
      platforms,
      topNarratives: topByFrequency(narratives, 3),
      reachScore: round(reach / n),
      credibilityScore: round(cred / n),
      amplificationScore: round(amp / n),
      connections: uniq(connections),
    });
  }

  return profiles.sort((a, b) => b.strategicWeight - a.strategicWeight);
}

function topByFrequency(items: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const it of items) counts.set(it, (counts.get(it) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

// ── Distribución de postura (ponderada por peso estratégico) ─────────────────

function buildStanceDistribution(mentions: Mention[]): StanceDistribution[] {
  const counts = emptyStanceRecord();
  const weights = emptyStanceRecord();
  let totalWeight = 0;
  for (const m of mentions) {
    const w = strategicWeight(m);
    counts[m.stance] += 1;
    weights[m.stance] += w;
    totalWeight += w;
  }
  const total = mentions.length || 1;
  return STANCES.map((stance) => ({
    stance,
    count: counts[stance],
    percent: round((counts[stance] / total) * 100),
    weight: round(totalWeight ? (weights[stance] / totalWeight) * 100 : 0),
  })).sort((a, b) => b.weight - a.weight);
}

// ── Narrativas dominantes + momentum ─────────────────────────────────────────

function buildNarratives(mentions: Mention[], now: Date): NarrativeInsight[] {
  const byTag = new Map<string, Mention[]>();
  for (const m of mentions) {
    for (const tag of m.narrativeTags) {
      const list = byTag.get(tag) ?? [];
      list.push(m);
      byTag.set(tag, list);
    }
  }

  const nowISO = now.toISOString();
  let maxWeight = 0;
  const raw = Array.from(byTag.entries()).map(([tag, list]) => {
    const breakdown = emptyStanceRecord();
    let weightSum = 0;
    let recentWeight = 0;
    let priorWeight = 0;
    const actors: string[] = [];

    for (const m of list) {
      const w = strategicWeight(m);
      breakdown[m.stance] += 1;
      weightSum += w;
      actors.push(m.actor);
      const age = daysBetween(nowISO, m.date);
      if (age <= RECENT_WINDOW_DAYS) recentWeight += w;
      else priorWeight += w;
    }

    maxWeight = Math.max(maxWeight, weightSum);

    // Momentum: crecimiento del peso reciente vs. previo, normalizado a -100..100.
    const denom = recentWeight + priorWeight || 1;
    const momentum = round(((recentWeight - priorWeight) / denom) * 100);

    return {
      tag,
      mentions: list.length,
      _weightSum: weightSum,
      dominantStance: dominantStance(breakdown),
      stanceBreakdown: breakdown,
      momentum,
      topActors: topByFrequency(actors, 3),
    };
  });

  return raw
    .map((r) => ({
      tag: r.tag,
      mentions: r.mentions,
      weight: round(maxWeight ? (r._weightSum / maxWeight) * 100 : 0),
      dominantStance: r.dominantStance,
      stanceBreakdown: r.stanceBreakdown,
      momentum: r.momentum,
      topActors: r.topActors,
    }))
    .sort((a, b) => b.weight - a.weight);
}

// ── Scores ejecutivos: riesgo, oportunidad, momentum narrativo ───────────────

function computeRiskScore(
  mentions: Mention[],
  narratives: NarrativeInsight[],
): number {
  // Peso crítico relativo: cuánto del peso estratégico total es crítico,
  // amplificado por narrativas críticas en aceleración.
  let criticalWeight = 0;
  let totalWeight = 0;
  for (const m of mentions) {
    const w = strategicWeight(m);
    totalWeight += w;
    if (m.stance === "critical") criticalWeight += w;
  }
  const base = totalWeight ? (criticalWeight / totalWeight) * 100 : 0;

  // Amplificador: narrativas críticas con momentum positivo suman riesgo.
  const accelerating = narratives.filter(
    (n) => n.dominantStance === "critical" && n.momentum > 0,
  );
  const amp = accelerating.reduce(
    (acc, n) => acc + (n.weight / 100) * (n.momentum / 100) * 22,
    0,
  );

  return round(clamp(base + amp));
}

function computeOpportunityScore(
  mentions: Mention[],
  narratives: NarrativeInsight[],
): number {
  let favorableWeight = 0;
  let totalWeight = 0;
  for (const m of mentions) {
    const w = strategicWeight(m);
    totalWeight += w;
    if (m.stance === "favorable") favorableWeight += w;
  }
  const base = totalWeight ? (favorableWeight / totalWeight) * 100 : 0;

  const rising = narratives.filter(
    (n) => n.dominantStance === "favorable" && n.momentum > 0,
  );
  const amp = rising.reduce(
    (acc, n) => acc + (n.weight / 100) * (n.momentum / 100) * 18,
    0,
  );

  return round(clamp(base + amp));
}

/** Momentum narrativo global: media de momentum ponderada por peso de narrativa. */
function computeNarrativeMomentum(narratives: NarrativeInsight[]): number {
  const totalWeight = narratives.reduce((a, n) => a + n.weight, 0) || 1;
  const weighted = narratives.reduce((a, n) => a + n.momentum * n.weight, 0);
  return round(weighted / totalWeight);
}

// ── Señales tempranas de riesgo ──────────────────────────────────────────────

function buildWarnings(
  mentions: Mention[],
  actors: ActorProfile[],
  narratives: NarrativeInsight[],
  now: Date,
): EarlyWarning[] {
  const warnings: EarlyWarning[] = [];
  const nowISO = now.toISOString();
  const highWeightActors = new Set(
    actors.filter((a) => a.strategicWeight >= 70).map((a) => a.actor),
  );

  // 1) Actores de alto peso con postura crítica reciente.
  const criticalHeavy = mentions.filter(
    (m) =>
      m.stance === "critical" &&
      highWeightActors.has(m.actor) &&
      daysBetween(nowISO, m.date) <= 10,
  );
  for (const m of criticalHeavy) {
    warnings.push({
      id: `w-actor-${m.id}`,
      severity: "alta",
      title: `Actor de alto peso en postura crítica: ${m.actor}`,
      detail: `"${truncate(m.text, 120)}" — alcance ${m.reachScore}, credibilidad ${m.credibilityScore}.`,
      actors: [m.actor, ...m.connectedActors].slice(0, 4),
      narrative: m.narrativeTags[0],
    });
  }

  // 2) Narrativas críticas en aceleración.
  for (const n of narratives) {
    if (n.dominantStance === "critical" && n.momentum >= 25) {
      warnings.push({
        id: `w-narr-${n.tag}`,
        severity: n.momentum >= 50 ? "alta" : "media",
        title: `Narrativa crítica acelerando: "${n.tag}"`,
        detail: `Momentum +${n.momentum} en los últimos ${RECENT_WINDOW_DAYS} días, impulsada por ${n.topActors.slice(0, 2).join(", ")}.`,
        actors: n.topActors,
        narrative: n.tag,
      });
    }
  }

  // 3) Tensión narrativa: una narrativa con favorable y crítico fuertes a la vez.
  for (const n of narratives) {
    const fav = n.stanceBreakdown.favorable;
    const crit = n.stanceBreakdown.critical;
    if (fav >= 2 && crit >= 2 && n.weight >= 55) {
      warnings.push({
        id: `w-tension-${n.tag}`,
        severity: "media",
        title: `Campo de batalla narrativo: "${n.tag}"`,
        detail: `Narrativa disputada (${fav} a favor vs. ${crit} en contra) entre actores de peso. Define posición pública o cederás el encuadre.`,
        actors: n.topActors,
        narrative: n.tag,
      });
    }
  }

  // Orden por severidad y deduplicado por título.
  const sevRank = { alta: 0, media: 1, baja: 2 } as const;
  const seen = new Set<string>();
  return warnings
    .filter((w) => (seen.has(w.title) ? false : (seen.add(w.title), true)))
    .sort((a, b) => sevRank[a.severity] - sevRank[b.severity])
    .slice(0, 6);
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n).trim()}…` : s;
}

// ── Recomendaciones ejecutivas ───────────────────────────────────────────────

function buildRecommendations(
  riskScore: number,
  opportunityScore: number,
  narratives: NarrativeInsight[],
  actors: ActorProfile[],
  warnings: EarlyWarning[],
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Defensa: si hay narrativa crítica top, atacar el encuadre.
  const topCritical = narratives.find((n) => n.dominantStance === "critical");
  if (topCritical) {
    recs.push({
      id: "r-defense-frame",
      kind: "defensa",
      title: `Contener la narrativa "${topCritical.tag}"`,
      rationale: `Es la narrativa crítica de mayor peso (${topCritical.weight}/100). Publica evidencia verificable que desactive el argumento de ${topCritical.topActors[0]} antes de que escale a prensa generalista.`,
      priority: riskScore >= 45 ? 1 : 2,
    });
  }

  // Oportunidad: amplificar la narrativa favorable con más momentum.
  const risingFav = [...narratives]
    .filter((n) => n.dominantStance === "favorable")
    .sort((a, b) => b.momentum - a.momentum)[0];
  if (risingFav) {
    recs.push({
      id: "r-amplify",
      kind: "oportunidad",
      title: `Amplificar "${risingFav.tag}" (momentum ${risingFav.momentum >= 0 ? "+" : ""}${risingFav.momentum})`,
      rationale: `Narrativa favorable en ascenso liderada por ${risingFav.topActors.slice(0, 2).join(" y ")}. Dales acceso, datos o vocería para consolidar el encuadre antes que la competencia.`,
      priority: opportunityScore >= 40 ? 1 : 2,
    });
  }

  // Aliado clave: actor favorable de mayor peso → cultivar relación.
  const champion = actors.find(
    (a) => a.dominantStance === "favorable" && a.role !== "competitor",
  );
  if (champion) {
    recs.push({
      id: "r-champion",
      kind: "oportunidad",
      title: `Activar a ${champion.actor} como aliado estratégico`,
      rationale: `Peso estratégico ${champion.strategicWeight}/100 y postura favorable. Es tu mejor multiplicador orgánico de mensaje en ${champion.platforms.join(", ")}.`,
      priority: 2,
    });
  }

  // Monitoreo: competidor de alto peso.
  const rival = actors.find((a) => a.role === "competitor");
  if (rival) {
    recs.push({
      id: "r-monitor-rival",
      kind: "monitoreo",
      title: `Vigilar el encuadre de ${rival.actor}`,
      rationale: `Competidor con peso ${rival.strategicWeight}/100 empujando la narrativa "${rival.topNarratives[0]}". Prepara respuesta para no quedar reactivo.`,
      priority: 3,
    });
  }

  // Regulación: si aparece como narrativa relevante.
  const reg = narratives.find((n) => n.tag === "Regulación");
  if (reg) {
    recs.push({
      id: "r-reg",
      kind: "monitoreo",
      title: "Posicionarse proactivamente ante el frente regulatorio",
      rationale: `La narrativa "Regulación" tiene peso ${reg.weight}/100. Convierte el cumplimiento temprano en ventaja reputacional con ${reg.topActors[0]}.`,
      priority: riskScore >= 40 ? 2 : 3,
    });
  }

  // Si el riesgo es alto y aún no hay defensa prioritaria, añadir respuesta a señal.
  if (riskScore >= 50 && warnings[0]) {
    recs.unshift({
      id: "r-warroom",
      kind: "defensa",
      title: "Activar sala de crisis ligera (war room)",
      rationale: `Riesgo en ${riskScore}/100 con señal de alta severidad: "${warnings[0].title}". Designa vocería y protocolo de respuesta en 24h.`,
      priority: 1,
    });
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 6);
}

// ── Resumen ejecutivo (texto narrativo derivado de las métricas) ─────────────

function buildExecutiveSummary(
  topic: string,
  stance: StanceDistribution[],
  actors: ActorProfile[],
  narratives: NarrativeInsight[],
  riskScore: number,
  opportunityScore: number,
  momentum: number,
): string[] {
  const dominant = stance[0];
  const topActor = actors[0];
  const topNarr = narratives[0];
  const climate =
    riskScore > opportunityScore + 10
      ? "defensivo"
      : opportunityScore > riskScore + 10
        ? "favorable"
        : "disputado";

  return [
    `El clima conversacional alrededor de ${topic} es **${climate}**: la postura de mayor peso estratégico es **${stanceLabel(dominant.stance)}** (${dominant.weight}% del peso total), no necesariamente la más numerosa.`,
    `**${topActor.actor}** (${roleLabel(topActor.role)}) concentra el mayor peso estratégico (${topActor.strategicWeight}/100) y marca el tono de la conversación con postura ${stanceLabel(topActor.dominantStance).toLowerCase()}.`,
    `La narrativa dominante es **"${topNarr.tag}"** (peso ${topNarr.weight}/100, momentum ${momentum >= 0 ? "+" : ""}${momentum}). ${momentum >= 10 ? "La conversación se está acelerando: hay ventana para encuadrar." : momentum <= -10 ? "La conversación pierde fuerza: prioriza consolidar, no reaccionar." : "La conversación está estable: actúa para inclinar el balance."}`,
    `Riesgo reputacional en **${riskScore}/100** y oportunidad narrativa en **${opportunityScore}/100**. ${riskScore >= 50 ? "Recomendamos respuesta activa esta semana." : "El frente es manejable con monitoreo y amplificación selectiva."}`,
  ];
}

function stanceLabel(s: Stance): string {
  return {
    favorable: "Favorable",
    critical: "Crítica",
    neutral: "Neutral",
    ambiguous: "Ambigua",
  }[s];
}

export function roleLabel(r: ActorProfile["role"]): string {
  return {
    journalist: "Periodista",
    founder: "Fundador/a",
    researcher: "Investigador/a",
    policymaker: "Regulador/a",
    investor: "Inversionista",
    creator: "Creador/a",
    competitor: "Competidor",
    academic: "Académico/a",
    analyst: "Analista",
    activist: "Activista",
  }[r];
}

// ── Red de actores (preview) ─────────────────────────────────────────────────

function buildNetwork(
  mentions: Mention[],
  actors: ActorProfile[],
): { nodes: NetworkNode[]; links: NetworkLink[] } {
  const top = actors.slice(0, 12);
  const ids = new Set(top.map((a) => a.actor));
  const nodes: NetworkNode[] = top.map((a) => ({
    id: a.actor,
    weight: a.strategicWeight,
    stance: a.dominantStance,
    role: a.role,
  }));

  const linkSet = new Set<string>();
  const links: NetworkLink[] = [];
  for (const m of mentions) {
    if (!ids.has(m.actor)) continue;
    for (const target of m.connectedActors) {
      if (target === m.actor || !ids.has(target)) continue;
      const key = [m.actor, target].sort().join("__");
      if (linkSet.has(key)) continue;
      linkSet.add(key);
      links.push({ source: m.actor, target });
    }
  }
  return { nodes, links };
}

// ── Orquestador principal ────────────────────────────────────────────────────

/**
 * Genera el reporte de inteligencia completo a partir de las menciones.
 * `now` se inyecta para que el cálculo de momentum sea determinista en demo.
 */
export function generateReport(
  mentions: Mention[],
  topic: string,
  now: Date = new Date("2026-06-05T12:00:00Z"),
): IntelligenceReport {
  const actors = buildActorProfiles(mentions);
  const stanceDistribution = buildStanceDistribution(mentions);
  const narratives = buildNarratives(mentions, now);
  const riskScore = computeRiskScore(mentions, narratives);
  const opportunityScore = computeOpportunityScore(mentions, narratives);
  const narrativeMomentum = computeNarrativeMomentum(narratives);
  const warnings = buildWarnings(mentions, actors, narratives, now);
  const recommendations = buildRecommendations(
    riskScore,
    opportunityScore,
    narratives,
    actors,
    warnings,
  );
  const executiveSummary = buildExecutiveSummary(
    topic,
    stanceDistribution,
    actors,
    narratives,
    riskScore,
    opportunityScore,
    narrativeMomentum,
  );
  const network = buildNetwork(mentions, actors);

  return {
    topic,
    generatedAt: now.toISOString(),
    totalMentions: mentions.length,
    totalActors: actors.length,
    riskScore,
    opportunityScore,
    narrativeMomentum,
    executiveSummary,
    stanceDistribution,
    topActors: actors,
    narratives,
    warnings,
    recommendations,
    network,
  };
}
