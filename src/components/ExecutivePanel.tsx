import { Fragment } from "react";
import type { ExecutiveLayer, Posture, StakeholderKey } from "@/lib/types";
import { Panel, SectionHeader } from "@/components/primitives";

// ─────────────────────────────────────────────────────────────────────────────
// Capa ejecutiva: brief para CEO, postura recomendada y recomendaciones por
// stakeholder. Se monta arriba del dashboard cuando report.executive existe.
// ─────────────────────────────────────────────────────────────────────────────

const POSTURE_COLOR: Record<Posture, string> = {
  defensiva: "var(--color-rose)",
  neutral: "var(--color-bone-dim)",
  proactiva: "var(--color-emerald)",
};

const POSTURE_LABEL: Record<Posture, string> = {
  defensiva: "Defensiva",
  neutral: "Neutral",
  proactiva: "Proactiva",
};

const STAKEHOLDER_LABEL: Record<StakeholderKey, string> = {
  board: "Board",
  ejecutivos: "Ejecutivos",
  empleados: "Empleados",
  clientes: "Clientes",
  reguladores: "Reguladores",
  medios: "Medios",
};

// Renderiza texto con énfasis **negrita** sin librerías de markdown.
function Emphasis({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-bone">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function PostureBadge({ posture }: { posture: Posture }) {
  const color = POSTURE_COLOR[posture];
  return (
    <span
      className="font-mono inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 36%, transparent)`,
        boxShadow: `0 0 18px color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
      />
      {POSTURE_LABEL[posture]}
    </span>
  );
}

export function ExecutivePanel({ executive }: { executive: ExecutiveLayer }) {
  return (
    <Panel className="p-6 md:p-8" delay={60}>
      <SectionHeader
        index="00"
        title="Copiloto ejecutivo"
        hint="Decisión en 60 segundos"
      />

      {/* Brief — 5 bullets para CEO */}
      <div className="space-y-3.5">
        {executive.brief.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span
              className="font-mono mt-1 shrink-0 text-[0.7rem]"
              style={{ color: "var(--color-amber)" }}
            >
              0{i + 1}
            </span>
            <p className="text-[0.95rem] leading-relaxed text-bone-dim">
              <Emphasis text={line} />
            </p>
          </div>
        ))}
      </div>

      {/* Positioning — postura recomendada + primer movimiento */}
      <div
        className="mt-7 rounded-xl p-5"
        style={{
          background: "var(--color-ink-850)",
          border: "1px solid var(--color-line)",
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="shrink-0">
            <div className="label-mono mb-2">Postura recomendada</div>
            <PostureBadge posture={executive.positioning.posture} />
          </div>
          <p className="text-sm leading-relaxed text-bone-dim md:pt-6">
            <Emphasis text={executive.positioning.rationale} />
          </p>
        </div>
        <div className="mt-4 flex gap-3 border-t border-line pt-4">
          <span
            className="font-mono mt-0.5 shrink-0 text-[0.7rem] tracking-wide"
            style={{ color: "var(--color-amber)" }}
          >
            PRIMER MOVIMIENTO →
          </span>
          <p className="text-sm leading-relaxed text-bone">
            <Emphasis text={executive.positioning.firstMove} />
          </p>
        </div>
      </div>

      {/* Stakeholder recs — una acción por audiencia */}
      <div className="mt-7">
        <div className="label-mono mb-3">Recomendaciones por stakeholder</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {executive.stakeholderRecs.map((rec) => (
            <div
              key={rec.stakeholder}
              className="rounded-xl p-4"
              style={{
                background: "var(--color-ink-850)",
                border: "1px solid var(--color-line)",
              }}
            >
              <span
                className="font-mono rounded-md px-2 py-0.5 text-[0.66rem] tracking-widest uppercase"
                style={{
                  color: "var(--color-violet)",
                  backgroundColor: "color-mix(in srgb, var(--color-violet) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-violet) 28%, transparent)",
                }}
              >
                {STAKEHOLDER_LABEL[rec.stakeholder]}
              </span>
              <p className="mt-2.5 text-sm leading-snug font-medium text-bone">
                {rec.action}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {rec.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
