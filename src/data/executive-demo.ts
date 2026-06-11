import type { ExecutiveLayer } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// Capa ejecutiva precalculada para el modo demo (caso Anthropic / Claude AI).
// En producción esta capa la genera Sonnet en el servidor; aquí está curada a
// mano con las cifras reales que el motor produce sobre el dataset semilla
// (riesgo 35, oportunidad 84, momentum +29) para que la demo muestre la
// experiencia completa sin necesidad de API keys.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_EXECUTIVE: ExecutiveLayer = {
  brief: [
    "La conversación crece (**momentum +29**) con **AI Safety** como narrativa dominante y postura mayoritariamente favorable hacia Anthropic.",
    "**Sam Altman** (peso 96.6) y los grandes competidores marcan el tono de la narrativa **Competencia**: el encuadre no lo controlamos nosotros.",
    "El riesgo (**35/100**) se concentra en la narrativa **\"Velocidad vs Seguridad\"**, crítica y en aceleración, alimentada por Yann LeCun, Gary Marcus y TechCrunch.",
    "La oportunidad (**84/100**) está en **Producto** y **Reputación de marca**, ambas con momentum +100 y voceros orgánicos como Casey Newton y Simon Willison.",
    "Actuar ahora: amplificar a los aliados de Producto esta semana y preparar respuesta técnica a \"Velocidad vs Seguridad\" antes de que salte a prensa generalista.",
  ],
  positioning: {
    posture: "proactiva",
    rationale:
      "La oportunidad (84) triplica al riesgo (35) y el momentum global es positivo (+29): hay ventana para encuadrar. La narrativa \"Competencia\" está disputada entre Altman, Nadella y Pichai — si Anthropic no habla, el encuadre lo fijan los competidores. Defensiva sería ceder iniciativa; neutral, desperdiciar el momentum de Producto.",
    firstMove:
      "El CEO publica esta semana una pieza técnica sobre interpretabilidad y seguridad, anclada en evidencia verificable, que responda a LeCun y Marcus sin nombrarlos.",
  },
  stakeholderRecs: [
    {
      stakeholder: "board",
      action:
        "Presentar el balance riesgo 35 / oportunidad 84 y aprobar presupuesto de vocería técnica para el trimestre.",
      rationale:
        "La ventana de \"Producto\" (momentum +100) es temporal; capturarla requiere recursos aprobados antes de que la narrativa \"Competencia\" la diluya.",
    },
    {
      stakeholder: "ejecutivos",
      action:
        "Designar un vocero técnico único para \"Velocidad vs Seguridad\" y darle datos de red-teaming publicables.",
      rationale:
        "Cinco actores de alto peso en postura crítica (LeCun, Marcus, TechCrunch, Mistral, Investigador Red Team) exigen respuesta coordinada, no múltiples voces improvisadas.",
    },
    {
      stakeholder: "empleados",
      action:
        "Compartir internamente los hitos de seguridad e interpretabilidad que sustentan la postura pública antes de publicarlos.",
      rationale:
        "La narrativa \"AI Safety\" (peso 100) es también la propuesta de empleo: el equipo debe poder defenderla con los mismos datos que el CEO.",
    },
    {
      stakeholder: "clientes",
      action:
        "Empaquetar casos de adopción empresarial con métricas de seguridad y dárselos a los champions que ya nos citan.",
      rationale:
        "\"Adopción empresarial\" (momentum +28) la impulsan voces externas como Casey Newton y un CISO Fortune 500: material concreto multiplica ese encuadre.",
    },
    {
      stakeholder: "reguladores",
      action:
        "Ofrecer briefing técnico proactivo a la Comisión Europea y la comisión del Senado antes de que pidan comparecencia.",
      rationale:
        "La narrativa \"Regulación\" tiene voceros neutrales hoy; llegar primero convierte el cumplimiento en ventaja frente a competidores bajo más escrutinio.",
    },
    {
      stakeholder: "medios",
      action:
        "Dar acceso anticipado a Casey Newton y Simon Willison al próximo lanzamiento, con embargo y datos exclusivos.",
      rationale:
        "Ambos lideran \"Producto\" y \"Reputación de marca\" (momentum +100) con postura favorable: son el canal orgánico de mayor peso disponible.",
    },
  ],
};
