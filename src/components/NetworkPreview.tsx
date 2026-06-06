import { roleLabel } from "@/lib/analysis";
import type { IntelligenceReport } from "@/lib/types";
import { Panel, SectionHeader, STANCE_COLOR, STANCE_LABEL } from "@/components/primitives";

// Preview de red de actores: layout radial determinista (sin física).
// El actor de mayor peso va al centro; el resto se distribuye en un anillo.
// Los enlaces representan citas/respuestas/menciones entre actores.

export function NetworkPreview({ report }: { report: IntelligenceReport }) {
  const W = 560;
  const H = 420;
  const cx = W / 2;
  const cy = H / 2;
  const { nodes, links } = report.network;

  // Posiciones: nodo 0 al centro, resto en anillo elíptico.
  const ring = nodes.slice(1);
  const pos = new Map<string, { x: number; y: number }>();
  pos.set(nodes[0]?.id ?? "", { x: cx, y: cy });
  ring.forEach((n, i) => {
    const angle = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
    pos.set(n.id, {
      x: cx + Math.cos(angle) * (W * 0.36),
      y: cy + Math.sin(angle) * (H * 0.36),
    });
  });

  const maxW = nodes[0]?.weight ?? 100;

  return (
    <Panel className="p-6" delay={240}>
      <SectionHeader index="06" title="Red de actores" hint="Quién se conecta con quién" />
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[460px]">
          {/* Enlaces */}
          {links.map((l, i) => {
            const a = pos.get(l.source);
            const b = pos.get(l.target);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--color-line)"
                strokeWidth={1}
                strokeOpacity={0.8}
              />
            );
          })}

          {/* Nodos */}
          {nodes.map((n, i) => {
            const p = pos.get(n.id);
            if (!p) return null;
            const r = 8 + (n.weight / maxW) * 16;
            const color = STANCE_COLOR[n.stance];
            const short = n.id.split(" ").slice(0, 2).join(" ");
            const below = p.y > cy;
            return (
              <g key={n.id} className="rise" style={{ animationDelay: `${260 + i * 50}ms` }}>
                <circle cx={p.x} cy={p.y} r={r + 6} fill={color} fillOpacity={0.08} />
                <circle cx={p.x} cy={p.y} r={r} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
                {i === 0 && <circle cx={p.x} cy={p.y} r={r + 6} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.5} />}
                <text
                  x={p.x}
                  y={below ? p.y + r + 13 : p.y - r - 6}
                  textAnchor="middle"
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
      {/* Leyenda */}
      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3">
        {(["favorable", "critical", "ambiguous", "neutral"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-[0.7rem] text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: STANCE_COLOR[s] }} />
            {STANCE_LABEL[s]}
          </span>
        ))}
        <span className="ml-auto text-[0.7rem] text-muted">
          Centro: <span className="text-bone-dim">{nodes[0]?.id}</span> ({roleLabel(nodes[0]?.role ?? "analyst")})
        </span>
      </div>
    </Panel>
  );
}
