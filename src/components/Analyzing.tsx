"use client";

import { useEffect, useState } from "react";

// Pantalla de "procesando" que simula el pipeline de inteligencia.
// Refuerza la percepción de un motor que hace trabajo real, no un filtro.

const STEPS = [
  "Recolectando menciones del ecosistema…",
  "Identificando actores y roles…",
  "Ponderando peso estratégico (alcance × credibilidad × amplificación)…",
  "Mapeando narrativas y momentum…",
  "Reconstruyendo red de relaciones…",
  "Detectando señales tempranas de riesgo…",
  "Redactando recomendaciones ejecutivas…",
];

export function Analyzing({ topic, onDone }: { topic: string; onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const perStep = 340;
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i + 1), perStep * (i + 1)),
    );
    const done = setTimeout(onDone, perStep * (STEPS.length + 1));
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-xl flex-col justify-center">
      <div className="label-mono" style={{ color: "var(--color-amber)" }}>
        Generando inteligencia ejecutiva
      </div>
      <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
        {topic}
      </h2>

      {/* Barra de progreso con barrido */}
      <div className="bar-track relative mt-7 h-1.5 w-full">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: `${(step / STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, var(--color-amber), var(--color-violet))",
          }}
        />
        <div className="sweep absolute inset-y-0 w-1/3" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} />
      </div>

      <ul className="mt-8 space-y-3">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.6rem]"
                style={{
                  border: `1px solid ${state === "pending" ? "var(--color-line)" : "var(--color-amber)"}`,
                  background: state === "done" ? "var(--color-amber)" : "transparent",
                  color: state === "done" ? "var(--color-ink-900)" : "var(--color-amber)",
                }}
              >
                {state === "done" ? "✓" : state === "active" ? "•" : ""}
              </span>
              <span
                style={{
                  color:
                    state === "pending"
                      ? "var(--color-muted)"
                      : state === "active"
                        ? "var(--color-bone)"
                        : "var(--color-bone-dim)",
                }}
              >
                {s}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
