import type { IntelligenceReport } from "@/lib/types";
import { Panel } from "@/components/primitives";
import { ScoreGauge } from "@/components/ScoreGauge";

// Tira superior de KPIs ejecutivos: riesgo, oportunidad, momentum y cobertura.

function MomentumCard({ value }: { value: number }) {
  const positive = value >= 0;
  const color = positive ? "var(--color-violet)" : "var(--color-rose)";
  const pct = Math.min(100, Math.abs(value));
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="label-mono">Momentum narrativo</div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-5xl font-semibold tabular-nums" style={{ color }}>
            {value >= 0 ? "+" : ""}
            {value}
          </span>
          <span className="text-sm text-muted">/ 100</span>
        </div>
      </div>
      <div className="mt-4">
        {/* Indicador bipolar: centro = sin cambio */}
        <div className="relative h-2 w-full rounded-full" style={{ background: "var(--color-ink-700)" }}>
          <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-line" />
          <div
            className="growbar absolute top-0 h-full rounded-full"
            style={{
              width: `${pct / 2}%`,
              left: positive ? "50%" : undefined,
              right: positive ? undefined : "50%",
              background: color,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-bone-dim">
          {value >= 10
            ? "La conversación se está acelerando. Ventana abierta para encuadrar."
            : value <= -10
              ? "La conversación pierde fuerza. Consolida, no reacciones."
              : "Conversación estable. Actúa para inclinar el balance."}
        </p>
      </div>
    </div>
  );
}

export function KpiStrip({ report }: { report: IntelligenceReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <Panel className="flex items-center justify-center p-6" delay={80} hover>
        <ScoreGauge
          value={report.riskScore}
          label="Riesgo reputacional"
          color="var(--color-rose)"
          caption="Peso crítico + narrativas en alza"
        />
      </Panel>
      <Panel className="flex items-center justify-center p-6" delay={140} hover>
        <ScoreGauge
          value={report.opportunityScore}
          label="Oportunidad narrativa"
          color="var(--color-emerald)"
          caption="Peso favorable + tracción"
        />
      </Panel>
      <Panel className="p-6" delay={200} hover>
        <MomentumCard value={report.narrativeMomentum} />
      </Panel>
      <Panel className="flex flex-col justify-between p-6" delay={260} hover>
        <div className="label-mono">Cobertura del análisis</div>
        <div className="mt-3 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-4xl font-semibold tabular-nums text-bone">
              {report.totalMentions}
            </span>
            <span className="text-xs text-muted">menciones ponderadas</span>
          </div>
          <div className="hair" />
          <div className="flex items-baseline justify-between">
            <span className="font-display text-4xl font-semibold tabular-nums text-bone">
              {report.totalActors}
            </span>
            <span className="text-xs text-muted">actores únicos</span>
          </div>
          <div className="hair" />
          <div className="flex items-baseline justify-between">
            <span className="font-display text-4xl font-semibold tabular-nums text-bone">
              {report.narratives.length}
            </span>
            <span className="text-xs text-muted">narrativas activas</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
