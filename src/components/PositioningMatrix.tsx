import type { IntelligenceReport, Stance } from "@/lib/types";
import { Panel, SectionHeader, STANCE_COLOR } from "@/components/primitives";

// Matriz de posicionamiento de actores:
//   eje X = postura (crítica ←→ favorable)
//   eje Y = peso estratégico (influencia)
// El cuadrante superior-izquierdo (alto peso + crítico) es la zona de riesgo;
// el superior-derecho (alto peso + favorable) es la zona de aliados.

const STANCE_X: Record<Stance, number> = {
  critical: 0.14,
  ambiguous: 0.4,
  neutral: 0.58,
  favorable: 0.86,
};

export function PositioningMatrix({ report }: { report: IntelligenceReport }) {
  const W = 560;
  const H = 360;
  const pad = 36;
  const actors = report.topActors.slice(0, 10);

  const x = (s: Stance) => pad + STANCE_X[s] * (W - pad * 2);
  const y = (weight: number) => H - pad - (weight / 100) * (H - pad * 2);

  return (
    <Panel className="p-6" delay={220}>
      <SectionHeader index="04" title="Matriz de posicionamiento" hint="Influencia × postura" />
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px]">
          {/* Cuadrantes de fondo */}
          <rect x={pad} y={pad} width={(W - pad * 2) / 2} height={(H - pad * 2) / 2} fill="rgba(251,113,133,0.06)" />
          <rect x={W / 2} y={pad} width={(W - pad * 2) / 2} height={(H - pad * 2) / 2} fill="rgba(52,211,153,0.06)" />

          {/* Rejilla */}
          {[0.25, 0.5, 0.75].map((g) => (
            <g key={g}>
              <line x1={pad + g * (W - pad * 2)} y1={pad} x2={pad + g * (W - pad * 2)} y2={H - pad} stroke="var(--color-line)" strokeDasharray="2 4" />
              <line x1={pad} y1={pad + g * (H - pad * 2)} x2={W - pad} y2={pad + g * (H - pad * 2)} stroke="var(--color-line)" strokeDasharray="2 4" />
            </g>
          ))}

          {/* Ejes */}
          <line x1={W / 2} y1={pad} x2={W / 2} y2={H - pad} stroke="var(--color-line)" />
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="var(--color-line)" />

          {/* Etiquetas de cuadrante */}
          <text x={pad + 6} y={pad + 16} className="font-mono" fontSize="9" fill="var(--color-rose)" letterSpacing="1.5">
            RIESGO · ALTO PESO
          </text>
          <text x={W - pad - 6} y={pad + 16} textAnchor="end" className="font-mono" fontSize="9" fill="var(--color-emerald)" letterSpacing="1.5">
            ALIADOS · ALTO PESO
          </text>
          <text x={pad + 6} y={H - pad - 6} className="font-mono" fontSize="9" fill="var(--color-muted)" letterSpacing="1.5">
            RUIDO CRÍTICO
          </text>
          <text x={W - pad - 6} y={H - pad - 6} textAnchor="end" className="font-mono" fontSize="9" fill="var(--color-muted)" letterSpacing="1.5">
            APOYO MENOR
          </text>

          {/* Ejes etiqueta */}
          <text x={pad} y={H - 8} className="font-mono" fontSize="8.5" fill="var(--color-muted)" letterSpacing="1.5">CRÍTICA</text>
          <text x={W - pad} y={H - 8} textAnchor="end" className="font-mono" fontSize="8.5" fill="var(--color-muted)" letterSpacing="1.5">FAVORABLE</text>

          {/* Nodos de actores */}
          {actors.map((a, i) => {
            const cx = x(a.dominantStance);
            const cy = y(a.strategicWeight);
            const r = 5 + (a.strategicWeight / 100) * 9;
            const color = STANCE_COLOR[a.dominantStance];
            // Etiqueta: apellido / primer término para no saturar.
            const short = a.actor.split(" ").slice(0, 2).join(" ");
            const labelLeft = cx > W * 0.7;
            return (
              <g key={a.actor} className="rise" style={{ animationDelay: `${300 + i * 60}ms` }}>
                <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.22} />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.4} />
                <circle cx={cx} cy={cy} r={2} fill={color} />
                <text
                  x={labelLeft ? cx - r - 5 : cx + r + 5}
                  y={cy + 3}
                  textAnchor={labelLeft ? "end" : "start"}
                  fontSize="9.5"
                  fill="var(--color-bone-dim)"
                  className="font-sans"
                >
                  {short}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Panel>
  );
}
