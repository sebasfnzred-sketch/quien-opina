import type { EarlyWarning, IntelligenceReport, SignalSeverity } from "@/lib/types";
import { Panel, SectionHeader } from "@/components/primitives";

const SEVERITY_STYLE: Record<SignalSeverity, { color: string; label: string }> = {
  alta: { color: "var(--color-rose)", label: "ALTA" },
  media: { color: "var(--color-amber)", label: "MEDIA" },
  baja: { color: "var(--color-bone-dim)", label: "BAJA" },
};

function WarningRow({ w }: { w: EarlyWarning }) {
  const s = SEVERITY_STYLE[w.severity];
  return (
    <div
      className="relative rounded-lg p-4 pl-5"
      style={{
        background: "var(--color-ink-800)",
        borderLeft: `2px solid ${s.color}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="font-mono text-[0.62rem] tracking-widest"
          style={{ color: s.color }}
        >
          ● SEVERIDAD {s.label}
        </span>
        {w.narrative && (
          <span className="font-mono text-[0.66rem] text-muted">{w.narrative}</span>
        )}
      </div>
      <h3 className="mt-1.5 text-sm font-semibold text-bone">{w.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-bone-dim">{w.detail}</p>
      {w.actors.length > 0 && (
        <div className="mt-2 text-[0.7rem] text-muted">
          Actores: <span className="text-bone-dim">{w.actors.join(" · ")}</span>
        </div>
      )}
    </div>
  );
}

export function WarningsPanel({ report }: { report: IntelligenceReport }) {
  return (
    <Panel className="flex h-full flex-col p-6" delay={180}>
      <SectionHeader
        index="07"
        title="Señales tempranas"
        hint="Riesgos antes de que escalen"
      />
      <div className="flex-1 space-y-3">
        {report.warnings.length === 0 ? (
          <p className="text-sm text-muted">Sin señales de riesgo relevantes en la ventana actual.</p>
        ) : (
          report.warnings.map((w, i) => (
            <div key={w.id} className="rise" style={{ animationDelay: `${i * 80}ms` }}>
              <WarningRow w={w} />
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
