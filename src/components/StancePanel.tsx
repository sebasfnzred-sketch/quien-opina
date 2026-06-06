import type { IntelligenceReport } from "@/lib/types";
import { Panel, SectionHeader, STANCE_COLOR, STANCE_LABEL } from "@/components/primitives";

// Distribución de postura PONDERADA por peso estratégico (no por volumen).
// Mostramos ambas cifras para evidenciar la diferencia con social listening clásico.

export function StancePanel({ report }: { report: IntelligenceReport }) {
  const dist = report.stanceDistribution;
  return (
    <Panel className="flex h-full flex-col p-6" delay={180}>
      <SectionHeader index="02" title="Postura" hint="Ponderada por peso" />
      <p className="-mt-2 mb-5 text-xs leading-relaxed text-muted">
        El <span className="text-bone-dim">% de peso</span> refleja la influencia real de cada
        postura; el volumen es solo conteo de menciones.
      </p>
      <div className="flex-1 space-y-5">
        {dist.map((d, i) => (
          <div key={d.stance}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium" style={{ color: STANCE_COLOR[d.stance] }}>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STANCE_COLOR[d.stance], boxShadow: `0 0 10px ${STANCE_COLOR[d.stance]}` }}
                />
                {STANCE_LABEL[d.stance]}
              </span>
              <span className="font-mono text-bone tabular-nums">
                {d.weight}%
                <span className="ml-2 text-muted">({d.count} menc.)</span>
              </span>
            </div>
            <div className="bar-track h-2.5 w-full">
              <div
                className="growbar h-full rounded-full"
                style={{
                  width: `${d.weight}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${STANCE_COLOR[d.stance]} 55%, transparent), ${STANCE_COLOR[d.stance]})`,
                  boxShadow: `0 0 12px color-mix(in srgb, ${STANCE_COLOR[d.stance]} 55%, transparent)`,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
