"use client";

import { useState } from "react";

// Landing / header con el input principal. Componente controlado desde la
// página: recibe el callback onGenerate.

const SUGGESTED = [
  "Anthropic / Claude AI",
  "OpenAI",
  "Regulación de IA en LATAM",
  "Energía nuclear",
];

export function SearchHero({
  onGenerate,
}: {
  onGenerate: (topic: string) => void;
}) {
  const [topic, setTopic] = useState("Anthropic / Claude AI");

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = topic.trim();
    if (t) onGenerate(t);
  };

  return (
    <section className="mx-auto flex min-h-[82vh] max-w-3xl flex-col justify-center py-16">
      {/* Marca */}
      <div className="rise mb-10 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, var(--color-amber), var(--color-violet))",
            boxShadow: "0 0 24px rgba(245,165,36,0.35)",
          }}
        >
          <span className="font-display text-lg font-bold text-ink-900">Q</span>
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">
          Quién<span style={{ color: "var(--color-amber)" }}>Opina</span>
        </span>
        <span className="label-mono ml-2 hidden sm:block">Actor Intelligence</span>
      </div>

      <div className="rise" style={{ animationDelay: "80ms" }}>
        <span
          className="font-mono text-[0.7rem] tracking-[0.2em] uppercase"
          style={{ color: "var(--color-violet)" }}
        >
          Inteligencia de actores estratégicos
        </span>
        <h1 className="font-display mt-4 text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
          No medimos menciones.
          <br />
          Detectamos <span style={{ color: "var(--color-amber)" }}>quién importa</span>,
          <br className="hidden md:block" /> qué narrativa crece y qué hacer.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-bone-dim">
          Inteligencia ejecutiva para marcas, causas y personas públicas. Identifica actores con
          peso real, posturas, narrativas en ascenso, riesgos reputacionales y oportunidades —
          no solo volumen y sentimiento.
        </p>
      </div>

      {/* Input */}
      <form
        onSubmit={submit}
        className="rise mt-9 flex flex-col gap-3 sm:flex-row"
        style={{ animationDelay: "160ms" }}
      >
        <div className="panel flex flex-1 items-center gap-3 px-4 py-1">
          <span className="text-muted">⌕</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Tema, marca o persona a analizar…"
            className="w-full bg-transparent py-3 text-base text-bone placeholder:text-muted focus:outline-none"
            aria-label="Tema a analizar"
          />
        </div>
        <button
          type="submit"
          className="group relative overflow-hidden rounded-2xl px-6 py-3.5 text-sm font-semibold text-ink-900 transition-transform active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, var(--color-amber), var(--color-amber-soft))",
            boxShadow: "0 0 30px rgba(245,165,36,0.3)",
          }}
        >
          Generar inteligencia ejecutiva
          <span className="ml-1.5">→</span>
        </button>
      </form>

      {/* Temas sugeridos */}
      <div className="rise mt-5 flex flex-wrap items-center gap-2" style={{ animationDelay: "240ms" }}>
        <span className="label-mono mr-1">Ejemplos:</span>
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => {
              setTopic(s);
              onGenerate(s);
            }}
            className="rounded-full border border-line px-3 py-1 text-xs text-bone-dim transition-colors hover:border-amber hover:text-bone"
          >
            {s}
          </button>
        ))}
      </div>

      <p className="rise mt-8 text-xs text-muted" style={{ animationDelay: "320ms" }}>
        Demo con datos semilla curados sobre el ecosistema de IA. El motor de análisis es real;
        las fuentes son simuladas para esta demostración.
      </p>
    </section>
  );
}
