"use client";

import { useCallback, useMemo, useState } from "react";
import { mentions, SEED_TOPIC } from "@/data/mentions";
import { generateReport } from "@/lib/analysis";
import type { IntelligenceReport } from "@/lib/types";
import { SearchHero } from "@/components/SearchHero";
import { Analyzing } from "@/components/Analyzing";
import { Dashboard } from "@/components/Dashboard";

type Phase = "idle" | "analyzing" | "done";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [topic, setTopic] = useState(SEED_TOPIC);
  const [liveReport, setLiveReport] = useState<IntelligenceReport | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Demo mode: runs the engine locally with the seed dataset (no API keys needed).
  const demoReport: IntelligenceReport = useMemo(
    () => generateReport(mentions, SEED_TOPIC),
    [],
  );

  const report = liveReport ?? demoReport;

  const handleGenerate = useCallback(async (t: string) => {
    setTopic(t);
    setAnalyzeError(null);
    setLiveReport(null);
    setPhase("analyzing");

    if (t.trim().toLowerCase() !== SEED_TOPIC.toLowerCase()) {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: t }),
        });
        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error ?? `HTTP ${res.status}`);
        }
        const data: IntelligenceReport = await res.json();
        setLiveReport(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        setAnalyzeError(msg);
      }
    }
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setLiveReport(null);
    setAnalyzeError(null);
  }, []);

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
            {analyzeError && (
              <div className="mb-6 rounded-lg border border-rose px-4 py-3 text-sm text-rose" style={{ background: "rgba(251,113,133,0.08)" }}>
                <span className="font-mono font-semibold">Error al obtener datos reales:</span> {analyzeError}
                <span className="ml-2 text-bone-dim">· Mostrando datos demo.</span>
              </div>
            )}
            <Dashboard report={report} />
            <footer className="mt-12 border-t border-line py-8 text-center text-xs text-muted">
              {liveReport
                ? `QuiénOpina · Datos reales · ${report.totalMentions} menciones analizadas`
                : "QuiénOpina · Demo de inteligencia de actores estratégicos · Datos semilla simulados, motor de análisis real."}
            </footer>
          </div>
        )}
      </div>
    </main>
  );
}
