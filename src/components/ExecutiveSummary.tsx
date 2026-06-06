import { Fragment } from "react";
import type { IntelligenceReport } from "@/lib/types";
import { Panel, SectionHeader } from "@/components/primitives";

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

export function ExecutiveSummary({ report }: { report: IntelligenceReport }) {
  return (
    <Panel className="p-6 md:p-8" delay={120}>
      <SectionHeader index="01" title="Resumen ejecutivo" hint="Lectura en 30 segundos" />
      <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
        {report.executiveSummary.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span
              className="font-mono mt-1 text-[0.7rem]"
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
    </Panel>
  );
}
