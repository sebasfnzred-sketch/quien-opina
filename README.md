# QuiénOpina · Actor Intelligence Dashboard

**Inteligencia de actores estratégicos para marcas, causas y personas públicas.**

No medimos menciones. Detectamos **quién importa**, **qué narrativa está creciendo** y **qué debería hacer una marca**.

A diferencia del social listening tradicional (que mide volumen y sentimiento), QuiénOpina pondera el **peso estratégico** de cada actor —alcance × credibilidad × amplificación— para responder cinco preguntas ejecutivas:

1. ¿Quién habla?
2. ¿Qué dice?
3. ¿Con quién se conecta?
4. ¿Qué actores tienen peso estratégico real?
5. ¿Qué riesgos reputacionales u oportunidades narrativas existen?

Este MVP es una demo funcional con el caso **Anthropic / Claude AI** usando datos semilla curados (menciones simuladas) y un **motor de análisis real**.

---

## ▶️ Correr localmente

Requiere Node 18+ (probado en Node 26).

```bash
cd quien-opina
npm install
npm run dev
```

Abre **http://localhost:3000**, escribe un tema (o usa un ejemplo) y pulsa **“Generar inteligencia ejecutiva”**.

Otros comandos:

```bash
npm run build   # build de producción
npm run start   # servir el build
```

---

## 🧠 Cómo funciona

```
src/
├── app/
│   ├── layout.tsx        # tipografías (Fraunces / Hanken / IBM Plex Mono) + metadata
│   ├── globals.css       # sistema de diseño: tokens, panel, animaciones
│   └── page.tsx          # flujo: landing → procesando → dashboard
├── data/
│   └── mentions.ts       # dataset semilla: 28 menciones (IA, seguridad, regulación, competencia)
├── lib/
│   ├── types.ts          # modelo de dominio (Mention, ActorProfile, IntelligenceReport…)
│   └── analysis.ts       # ⭐ motor de inteligencia
└── components/
    ├── primitives.tsx        # badges, barras, encabezados reutilizables
    ├── SearchHero.tsx        # landing + input
    ├── Analyzing.tsx         # pipeline simulado de procesamiento
    ├── Dashboard.tsx         # compositor del reporte
    ├── KpiStrip.tsx          # riesgo / oportunidad / momentum / cobertura
    ├── ScoreGauge.tsx        # medidor de arco SVG
    ├── ExecutiveSummary.tsx
    ├── StancePanel.tsx       # distribución de postura ponderada
    ├── ActorTable.tsx        # actores ordenados por peso estratégico
    ├── PositioningMatrix.tsx # influencia × postura (SVG)
    ├── NarrativePanel.tsx    # narrativas + momentum
    ├── NetworkPreview.tsx    # red de relaciones (SVG)
    ├── WarningsPanel.tsx     # señales tempranas de riesgo
    └── RecommendationsPanel.tsx
```

### El motor (`src/lib/analysis.ts`)

- **`strategicWeight(m)`** — peso de una mención: `0.34·alcance + 0.40·credibilidad + 0.26·amplificación`. La credibilidad pesa más que el alcance crudo.
- **Perfiles de actor** — agrega menciones por actor, promedia el peso y añade un *bonus logarítmico* por persistencia.
- **Distribución de postura** — ponderada por peso, no por volumen (la diferencia clave vs. social listening).
- **Narrativas + momentum** — agrupa por etiqueta y compara el peso de los últimos 7 días contra el periodo previo.
- **Risk / Opportunity Score** — proporción de peso crítico/favorable, amplificada por narrativas en aceleración.
- **Señales tempranas** — actores de alto peso en postura crítica, narrativas críticas acelerando y “campos de batalla” narrativos.
- **Recomendaciones** — derivadas de los scores y señales (defensa / oportunidad / monitoreo).

> El cálculo es determinista: `generateReport` recibe una fecha de referencia (`2026-06-05`) para que el momentum sea reproducible en la demo.

---

## 🚀 Deploy en Vercel

```bash
npm i -g vercel      # si no lo tienes
vercel               # deploy de preview
vercel --prod        # deploy a producción
```

O vía dashboard: importa el repo en [vercel.com/new](https://vercel.com/new). Vercel detecta Next.js automáticamente — sin configuración extra, sin variables de entorno (no hay backend ni DB en este MVP).

---

## 🗺️ Próximos 3 features

1. **Ingesta real por tema** — conectar X/API, RSS de prensa y newsletters; clasificar postura y rol con un LLM (Claude) para reemplazar el dataset semilla por datos en vivo.
2. **Series de tiempo + alertas** — histórico de momentum por narrativa y notificaciones (email/Slack) cuando una narrativa crítica supera un umbral de aceleración.
3. **Reportes exportables y multi-tema** — guardar análisis por cliente, comparar marca vs. competidores en una misma vista y exportar el reporte ejecutivo a PDF.

---

*Stack: Next.js 15 · React 19 · TypeScript · Tailwind CSS v4. Sin backend, sin DB, sin auth — todo corre en cliente sobre el dataset semilla.*
