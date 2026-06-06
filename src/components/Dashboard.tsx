import type { IntelligenceReport } from "@/lib/types";
import { KpiStrip } from "@/components/KpiStrip";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { StancePanel } from "@/components/StancePanel";
import { ActorTable } from "@/components/ActorTable";
import { PositioningMatrix } from "@/components/PositioningMatrix";
import { NarrativePanel } from "@/components/NarrativePanel";
import { NetworkPreview } from "@/components/NetworkPreview";
import { WarningsPanel } from "@/components/WarningsPanel";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";

// Compositor del dashboard ejecutivo. Orden pensado como lectura de reporte:
// resumen → KPIs → actores → narrativas → red → señales → acciones.

function DashboardHeader({ report }: { report: IntelligenceReport }) {
  const date = new Date(report.generatedAt).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="label-mono flex items-center gap-2">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full" style={{ background: "var(--color-emerald)" }} />
          Reporte de inteligencia · en vivo
        </div>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-bone md:text-5xl">
          {report.topic}
        </h1>
      </div>
      <div className="text-left md:text-right">
        <div className="font-mono text-xs text-muted">GENERADO · {date}</div>
        <div className="mt-1 text-xs text-bone-dim">
          {report.totalMentions} menciones · {report.totalActors} actores · {report.narratives.length} narrativas
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ report }: { report: IntelligenceReport }) {
  return (
    <div className="space-y-5">
      <DashboardHeader report={report} />

      {/* KPIs ejecutivos */}
      <KpiStrip report={report} />

      {/* Resumen ejecutivo */}
      <ExecutiveSummary report={report} />

      {/* Actores (ancho) + Postura (lateral) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActorTable report={report} />
        </div>
        <StancePanel report={report} />
      </div>

      {/* Matriz + Narrativas */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PositioningMatrix report={report} />
        <NarrativePanel report={report} />
      </div>

      {/* Red + Señales */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <NetworkPreview report={report} />
        <WarningsPanel report={report} />
      </div>

      {/* Recomendaciones */}
      <RecommendationsPanel report={report} />
    </div>
  );
}
