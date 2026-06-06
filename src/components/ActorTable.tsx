import { roleLabel } from "@/lib/analysis";
import type { IntelligenceReport } from "@/lib/types";
import {
  Panel,
  ScoreBar,
  SectionHeader,
  StanceBadge,
  STANCE_COLOR,
} from "@/components/primitives";

// Tabla de actores ordenada por peso estratégico — el corazón del producto.

export function ActorTable({ report }: { report: IntelligenceReport }) {
  const actors = report.topActors.slice(0, 9);
  const max = actors[0]?.strategicWeight ?? 100;

  return (
    <Panel className="p-6" delay={140}>
      <SectionHeader
        index="03"
        title="Actores estratégicos"
        hint="Ordenados por peso, no por volumen"
      />

      {/* Encabezado de tabla (desktop) */}
      <div className="hidden grid-cols-12 gap-3 px-3 pb-2 md:grid">
        <span className="label-mono col-span-4">Actor</span>
        <span className="label-mono col-span-2">Rol</span>
        <span className="label-mono col-span-2">Postura</span>
        <span className="label-mono col-span-4 text-right">Peso estratégico</span>
      </div>

      <div className="space-y-1">
        {actors.map((a, i) => (
          <div
            key={a.actor}
            className="group grid grid-cols-1 items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-ink-800 md:grid-cols-12"
            style={{ borderBottom: "1px dashed var(--color-line)" }}
          >
            {/* Actor */}
            <div className="col-span-4 flex items-center gap-3">
              <span
                className="font-mono text-xs tabular-nums"
                style={{ color: i < 3 ? "var(--color-amber)" : "var(--color-muted)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-bone">{a.actor}</div>
                <div className="font-mono truncate text-[0.7rem] text-muted">
                  {a.handle ?? "—"} · {a.platforms.join(" · ")}
                </div>
              </div>
            </div>

            {/* Rol */}
            <div className="col-span-2 text-xs text-bone-dim">{roleLabel(a.role)}</div>

            {/* Postura */}
            <div className="col-span-2">
              <StanceBadge stance={a.dominantStance} />
            </div>

            {/* Peso */}
            <div className="col-span-4 flex items-center gap-3">
              <div className="flex-1">
                <ScoreBar
                  value={(a.strategicWeight / max) * 100}
                  color={STANCE_COLOR[a.dominantStance]}
                  delay={i * 80}
                />
              </div>
              <span className="font-mono w-9 text-right text-sm font-semibold tabular-nums text-bone">
                {a.strategicWeight}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
