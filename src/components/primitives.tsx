import type { ReactNode } from "react";
import type { Stance } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Primitivas de UI reutilizables: badges, barras, encabezados, contenedores.
// Centralizar aquí el lenguaje visual (colores por postura, etiquetas) evita
// inconsistencias entre paneles.
// ─────────────────────────────────────────────────────────────────────────────

/** Color hexadecimal de acento por postura — fuente única de verdad. */
export const STANCE_COLOR: Record<Stance, string> = {
  favorable: "var(--color-emerald)",
  critical: "var(--color-rose)",
  neutral: "var(--color-bone-dim)",
  ambiguous: "var(--color-amber)",
};

export const STANCE_LABEL: Record<Stance, string> = {
  favorable: "Favorable",
  critical: "Crítica",
  neutral: "Neutral",
  ambiguous: "Ambigua",
};

export function StanceDot({ stance, className = "" }: { stance: Stance; className?: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: STANCE_COLOR[stance], boxShadow: `0 0 10px ${STANCE_COLOR[stance]}` }}
    />
  );
}

export function StanceBadge({ stance }: { stance: Stance }) {
  const color = STANCE_COLOR[stance];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 32%, transparent)`,
      }}
    >
      <StanceDot stance={stance} />
      {STANCE_LABEL[stance]}
    </span>
  );
}

/** Etiqueta tipo "tag" monoespaciada para narrativas/plataformas. */
export function Tag({ children, accent }: { children: ReactNode; accent?: string }) {
  const color = accent ?? "var(--color-bone-dim)";
  return (
    <span
      className="font-mono rounded-md px-2 py-0.5 text-[0.66rem] tracking-wide"
      style={{
        color,
        backgroundColor: "var(--color-ink-700)",
        border: "1px solid var(--color-line)",
      }}
    >
      {children}
    </span>
  );
}

/** Barra horizontal de score 0–100 con relleno animado. */
export function ScoreBar({
  value,
  color = "var(--color-amber)",
  height = 6,
  delay = 0,
}: {
  value: number;
  color?: string;
  height?: number;
  delay?: number;
}) {
  return (
    <div className="bar-track w-full" style={{ height }}>
      <div
        className="growbar h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: `linear-gradient(90deg, color-mix(in srgb, ${color} 55%, transparent), ${color})`,
          boxShadow: `0 0 12px color-mix(in srgb, ${color} 60%, transparent)`,
          animationDelay: `${delay}ms`,
        }}
      />
    </div>
  );
}

/** Pastilla de momentum con flecha y color según signo. */
export function MomentumPill({ value }: { value: number }) {
  const positive = value >= 0;
  const color = positive ? "var(--color-emerald)" : "var(--color-rose)";
  const arrow = value > 4 ? "↑" : value < -4 ? "↓" : "→";
  return (
    <span
      className="font-mono inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.7rem]"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      {arrow} {positive ? "+" : ""}
      {value}
    </span>
  );
}

/** Encabezado de sección con índice y línea. */
export function SectionHeader({
  index,
  title,
  hint,
  action,
}: {
  index: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <span className="label-mono" style={{ color: "var(--color-amber)" }}>
          {index}
        </span>
        <h2 className="font-display text-xl leading-none font-semibold tracking-tight text-bone md:text-2xl">
          {title}
        </h2>
      </div>
      {hint && !action && (
        <span className="label-mono hidden md:block">{hint}</span>
      )}
      {action}
    </div>
  );
}

/** Contenedor panel con animación de entrada. */
export function Panel({
  children,
  className = "",
  delay = 0,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}) {
  return (
    <div
      className={`panel rise ${hover ? "panel-hover" : ""} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
