// ─────────────────────────────────────────────────────────────────────────────
// Tipos centrales del motor de inteligencia de actores de QuiénOpina.
// Todo el dominio (menciones, actores, narrativas, señales) se modela aquí.
// ─────────────────────────────────────────────────────────────────────────────

/** Tipo de actor según su función en la conversación pública. */
export type Role =
  | "journalist"
  | "founder"
  | "researcher"
  | "policymaker"
  | "investor"
  | "creator"
  | "competitor"
  | "academic"
  | "analyst"
  | "activist";

/** Postura del actor frente al tema analizado. */
export type Stance = "favorable" | "critical" | "neutral" | "ambiguous";

/** Plataforma donde ocurre la mención. */
export type Platform =
  | "X"
  | "LinkedIn"
  | "Substack"
  | "YouTube"
  | "Press"
  | "Podcast"
  | "Reddit"
  | "Blog";

/**
 * Una mención = una unidad atómica de señal capturada en el ecosistema.
 * Los tres scores (0–100) son la materia prima del peso estratégico.
 */
export interface Mention {
  id: string;
  actor: string;
  handle?: string;
  role: Role;
  platform: Platform;
  text: string;
  stance: Stance;
  /** Alcance potencial de audiencia (seguidores, lectores, escucha). */
  reachScore: number;
  /** Credibilidad / autoridad percibida del actor en el dominio. */
  credibilityScore: number;
  /** Capacidad de que su mensaje sea replicado y amplificado por terceros. */
  amplificationScore: number;
  /** Fecha ISO de la mención. */
  date: string;
  /** Otros actores con los que se conecta / a quienes cita o responde. */
  connectedActors: string[];
  /** Etiquetas de narrativa asociadas a la mención. */
  narrativeTags: string[];
}

// ── Tipos derivados del motor de análisis ───────────────────────────────────

export interface ActorProfile {
  actor: string;
  handle?: string;
  role: Role;
  /** Peso estratégico agregado (0–100). */
  strategicWeight: number;
  mentions: number;
  dominantStance: Stance;
  stanceBreakdown: Record<Stance, number>;
  platforms: Platform[];
  topNarratives: string[];
  reachScore: number;
  credibilityScore: number;
  amplificationScore: number;
  /** Conexiones únicas con otros actores del dataset. */
  connections: string[];
}

export interface StanceDistribution {
  stance: Stance;
  count: number;
  percent: number;
  /** Peso estratégico acumulado de las menciones de esta postura. */
  weight: number;
}

export interface NarrativeInsight {
  tag: string;
  mentions: number;
  /** Peso estratégico acumulado de la narrativa (0–100 normalizado). */
  weight: number;
  dominantStance: Stance;
  stanceBreakdown: Record<Stance, number>;
  /** Momentum -100..100: crecimiento reciente vs. periodo previo. */
  momentum: number;
  topActors: string[];
}

export type SignalSeverity = "alta" | "media" | "baja";

export interface EarlyWarning {
  id: string;
  severity: SignalSeverity;
  title: string;
  detail: string;
  actors: string[];
  narrative?: string;
}

export type RecommendationKind = "defensa" | "oportunidad" | "monitoreo";

export interface Recommendation {
  id: string;
  kind: RecommendationKind;
  title: string;
  rationale: string;
  /** Prioridad 1 (máxima) – 3. */
  priority: 1 | 2 | 3;
}

/** Nodo y enlace para el preview de red de actores. */
export interface NetworkNode {
  id: string;
  weight: number;
  stance: Stance;
  role: Role;
}
export interface NetworkLink {
  source: string;
  target: string;
}

/** Resultado completo del motor: lo que consume el dashboard. */
export interface IntelligenceReport {
  topic: string;
  generatedAt: string;
  totalMentions: number;
  totalActors: number;
  riskScore: number;
  opportunityScore: number;
  narrativeMomentum: number;
  executiveSummary: string[];
  stanceDistribution: StanceDistribution[];
  topActors: ActorProfile[];
  narratives: NarrativeInsight[];
  warnings: EarlyWarning[];
  recommendations: Recommendation[];
  network: { nodes: NetworkNode[]; links: NetworkLink[] };
}
