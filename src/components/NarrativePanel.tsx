import type { IntelligenceReport } from "@/lib/types";
import {
  MomentumPill,
  Panel,
  SectionHeader,
  StanceDot,
  STANCE_COLOR,
  STANCE_LABEL,
  Tag,
} from "@/components/primitives";

// Narrativas dominantes con su peso, postura dominante y momentum.

export function NarrativePanel({ report }: { report: IntelligenceReport }) {
  const narratives = report.narratives.slice(0, 7);
  return (
    <Panel className="flex h-full flex-col p-6" delay={200}>
      <SectionHeader index="05" title="Narrativas clave" hint="Qué se está diciendo" />
      <div className="flex-1 space-y-4">
        {narratives.map((n, i) => (
          <div key={n.tag} className="rise" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <StanceDot stance={n.dominantStance} />
                <span className="truncate text-sm font-semibold text-bone">{n.tag}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <MomentumPill value={n.momentum} />
                <span className="font-mono text-xs text-muted tabular-nums">{n.weight}</span>
              </div>
            </div>
            {/* Barra de composición de postura dentro de la narrativa */}
            <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--color-ink-700)" }}>
              {(["favorable", "ambiguous", "neutral", "critical"] as const).map((s) => {
                const total = n.mentions || 1;
                const pct = (n.stanceBreakdown[s] / total) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={s}
                    title={`${STANCE_LABEL[s]}: ${n.stanceBreakdown[s]}`}
                    style={{ width: `${pct}%`, background: STANCE_COLOR[s] }}
                  />
                );
              })}
            </div>
            <div className="mt-1.5 text-[0.7rem] text-muted">
              Impulsada por <span className="text-bone-dim">{n.topActors.slice(0, 2).join(", ")}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// Versión compacta de tags de narrativa (chips) por si se requiere en otro lugar.
export function NarrativeChips({ report }: { report: IntelligenceReport }) {
  return (
    <div className="flex flex-wrap gap-2">
      {report.narratives.slice(0, 8).map((n) => (
        <Tag key={n.tag} accent={STANCE_COLOR[n.dominantStance]}>
          {n.tag}
        </Tag>
      ))}
    </div>
  );
}
