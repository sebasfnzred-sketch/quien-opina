import type { IntelligenceReport, RecommendationKind } from "@/lib/types";
import { Panel, SectionHeader } from "@/components/primitives";

const KIND_STYLE: Record<RecommendationKind, { color: string; label: string; icon: string }> = {
  defensa: { color: "var(--color-rose)", label: "Defensa", icon: "⛨" },
  oportunidad: { color: "var(--color-emerald)", label: "Oportunidad", icon: "↗" },
  monitoreo: { color: "var(--color-violet)", label: "Monitoreo", icon: "◎" },
};

export function RecommendationsPanel({ report }: { report: IntelligenceReport }) {
  return (
    <Panel className="p-6" delay={160}>
      <SectionHeader
        index="08"
        title="Acciones recomendadas"
        hint="Qué debería hacer la marca"
      />
      <div className="grid gap-3 md:grid-cols-2">
        {report.recommendations.map((r, i) => {
          const k = KIND_STYLE[r.kind];
          return (
            <div
              key={r.id}
              className="rise panel-hover relative overflow-hidden rounded-xl p-4"
              style={{
                background: "var(--color-ink-800)",
                border: "1px solid var(--color-line)",
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Acento lateral */}
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ background: k.color }}
              />
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.66rem] font-medium"
                  style={{
                    color: k.color,
                    background: `color-mix(in srgb, ${k.color} 13%, transparent)`,
                  }}
                >
                  {k.icon} {k.label}
                </span>
                <span className="font-mono text-[0.66rem] text-muted">
                  P{r.priority}
                </span>
              </div>
              <h3 className="mt-2.5 text-sm font-semibold leading-snug text-bone">
                {r.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-bone-dim">{r.rationale}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
