"use client";

import { useCallback, useMemo, useState } from "react";
import { mentions } from "@/data/mentions";
import { generateReport } from "@/lib/analysis";
import type { IntelligenceReport } from "@/lib/types";
import { SearchHero } from "@/components/SearchHero";
import { Analyzing } from "@/components/Analyzing";
import { Dashboard } from "@/components/Dashboard";

type Phase = "idle" | "analyzing" | "done";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [topic, setTopic] = useState("Anthropic / Claude AI");

  // El motor analiza el dataset semilla y personaliza el encabezado con el
  // tema ingresado. (En producción, aquí entraría la ingesta real por tema.)
  const report: IntelligenceReport = useMemo(
    () => generateReport(mentions, topic),
    [topic],
  );

  const handleGenerate = useCallback((t: string) => {
    setTopic(t);
    setPhase("analyzing");
  }, []);

  const reset = useCallback(() => setPhase("idle"), []);

  return (
    <main className="min-h-screen">
      {/* Barra superior persistente cuando hay dashboard */}
      {phase === "done" && (
        <header className="sticky top-0 z-30 border-b border-line backdrop-blur-xl" style={{ background: "rgba(7,8,12,0.72)" }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
            <button onClick={reset} className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: "linear-gradient(135deg, var(--color-amber), var(--color-violet))" }}
              >
                <span className="font-display text-sm font-bold text-ink-900">Q</span>
              </span>
              <span className="font-display text-sm font-semibold">
                Quién<span style={{ color: "var(--color-amber)" }}>Opina</span>
              </span>
            </button>
            <button
              onClick={reset}
              className="rounded-full border border-line px-4 py-1.5 text-xs text-bone-dim transition-colors hover:border-amber hover:text-bone"
            >
              ← Analizar otro tema
            </button>
          </div>
        </header>
      )}

      <div className="mx-auto max-w-7xl px-5">
        {phase === "idle" && <SearchHero onGenerate={handleGenerate} />}
        {phase === "analyzing" && (
          <Analyzing topic={topic} onDone={() => setPhase("done")} />
        )}
        {phase === "done" && (
          <div className="py-8">
            <Dashboard report={report} />
            <footer className="mt-12 border-t border-line py-8 text-center text-xs text-muted">
              QuiénOpina · Demo de inteligencia de actores estratégicos · Datos semilla simulados,
              motor de análisis real.
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
