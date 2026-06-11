# CLAUDE.md — Memoria permanente del proyecto QuiénOpina

Este archivo es la fuente de verdad para cualquier sesión futura de Claude Code.
Léelo completo antes de tocar cualquier archivo del proyecto.

---

## Estado actual (junio 2026)

**MVP 1 + Sprint 1 + MVP 2 + filtro de relevancia — EN PRODUCCIÓN. Pipeline real validado.**

- GitHub: `https://github.com/sebasfnzred-sketch/quien-opina`
- **Rama principal: `main`** (commit `d4f3ccb` — merge de toda la rama de desarrollo)
- **Producción: `https://quien-opina.vercel.app`** — deploy activo, Ready.
- **Validado en producción el 2026-06-10** con temas `OpenAI` y `Tesla`.
  Pipeline completo: NewsAPI → Relevance Filter → Haiku → InsForge → Motor → Sonnet.
- `phase-2-supabase-ingestion` ya mergeada a `main`. Trabajo futuro desde `main` o rama nueva.

---

## Qué funcionalidades YA EXISTEN (no reconstruir)

### MVP 1 — Dashboard ejecutivo (commit `d0a61ec`)
- Landing con input de tema y botones de temas sugeridos.
- Pantalla de "analizando" con pipeline de pasos animados (~3 s).
- Dashboard con 8 paneles: KPIs (riesgo/oportunidad/momentum/cobertura), resumen
  ejecutivo, tabla de actores, distribución de postura ponderada, matriz de
  posicionamiento SVG, narrativas con momentum, red de actores SVG, señales
  tempranas, recomendaciones.
- Motor analítico determinista completo (`src/lib/analysis.ts`).
- Dataset semilla de 28 menciones curadas (caso Anthropic / Claude AI).
- Sistema de diseño completo "Terminal de Inteligencia Ejecutiva".

### Sprint 1 — Pipeline de datos reales (commit `16f11d5`)
- **NewsAPI ingestion** (`src/lib/ingestion/newsapi.ts`): busca artículos por tema
  (`/v2/everything`, solo `language: "en"`, 20 artículos por corrida). ID estable =
  SHA-1 del URL del artículo → re-correr un tema no duplica.
- **Claude classification** (`src/lib/ingestion/classify.ts`): `claude-haiku-4-5`
  con tool-use + JSON schema estricto, batches de 10. Clasifica stance, role, los
  3 scores (0-100), narrativeTags y connectedActors.
- **InsForge persistence** (`src/lib/insforge.ts` + `src/lib/db.ts`): cliente
  server-only lazy (env vars sin `NEXT_PUBLIC_`). Tablas `mentions` (dedup por id)
  y `report_snapshots` (reporte completo como JSONB por corrida). Schema SQL en
  `docs/insforge-setup.sql` (incluye índices y RLS permisivo `allow_all`).
- **`/api/analyze`** (`src/app/api/analyze/route.ts`): POST `{topic}` →
  fetch NewsAPI → clasificar → persistir → cargar histórico del tema → motor →
  **síntesis ejecutiva (MVP 2)** → snapshot → devuelve `IntelligenceReport`.
- **Frontend conectado** (`page.tsx`): tema ≠ seed → llama `/api/analyze`; si
  falla, muestra error + fallback al reporte demo.

**Estado:** código completo de punta a punta, compila, **VALIDADO end-to-end**
el 2026-06-10. Primer análisis real ejecutado con el tema `OpenAI`:
20 menciones reales de prensa, riesgo 83/100, oportunidad 17/100, capa
ejecutiva generada por Sonnet, 20 filas persistidas en `mentions`, 2 snapshots
en `report_snapshots`. Pipeline funciona de punta a punta en localhost.

### MVP 2 — Capa de inteligencia ejecutiva (commit `8b96fbe`)
Convierte el producto de "dashboard analítico" a "copiloto ejecutivo". Tres
entregables visibles, montados ARRIBA del dashboard existente (que no cambió):
- **Executive Brief**: 5 bullets para CEO (qué pasa / por qué importa / riesgo /
  oportunidad / qué hacer ahora).
- **Executive Positioning**: postura recomendada (defensiva | neutral | proactiva)
  con rationale y "primer movimiento" ejecutable en 24-48 h.
- **Stakeholder Recommendations**: acción + porqué para 6 audiencias (board,
  ejecutivos, empleados, clientes, reguladores, medios).

Piezas:
- **`ExecutiveLayer`** (`src/lib/types.ts`): tipo de la capa; campo **opcional**
  `executive?` en `IntelligenceReport` → cero rupturas, snapshots viejos válidos.
- **`synthesizeExecutiveLayer`** (`src/lib/ingestion/synthesize.ts`): UN llamado a
  `claude-sonnet-4-6` con tool-use + schema estricto. Recibe el reporte
  determinista compactado (~2-3K tokens, sin menciones crudas). Regla de oro en el
  prompt: el LLM NO calcula números, solo explica los del motor. Devuelve `null`
  ante cualquier fallo → el análisis nunca se cae por la síntesis.
- **`ExecutivePanel`** (`src/components/ExecutivePanel.tsx`): server component,
  solo primitivas existentes. Primer panel del Dashboard si `report.executive` existe.
- **`DEMO_EXECUTIVE`** (`src/data/executive-demo.ts`): capa curada a mano para el
  modo demo (Sonnet solo corre server-side). Usa las cifras REALES que el motor
  produce sobre el seed: riesgo 35, oportunidad 84, momentum +29. ⚠️ Si se edita el
  dataset semilla, estas cifras quedan desfasadas — regenerarlas.
- **Fixes de UX** (mismo commit): (1) `page.tsx` ya no muestra el demo mientras
  `/api/analyze` está pendiente — dos refs (`fetchPendingRef`, `animDoneRef`) y la
  fase pasa a `done` solo cuando animación Y fetch terminaron; (2) `DemoBanner`
  solo aparece cuando el reporte mostrado es demo (`<Dashboard demo={!liveReport}>`).
- **Supuesto de perspectiva**: la síntesis asume que el lector es la organización
  protagonista del tema. Input de perspectiva = extensión futura.

## Qué NO existe todavía

- Soporte de temas en español en la ingesta (NewsAPI está fijo en `language: "en"`).
- `sourceUrl` en menciones persistidas (se captura de NewsAPI pero se descarta en
  la clasificación — el tipo `Mention` no lo tiene). Bloquea citas/evidencia clickeable.
- Equivalentes de idioma incompletos en `relevance.ts`: artículos en portugués
  ("Copa do Mundo") y en español no matchean porque NewsAPI los trae en inglés
  pero el filtro no cubre todas las variantes latinas. Cubrir los casos más comunes.
- Autenticación, rate limiting en `/api/analyze`.
- Histórico visible / series de tiempo (los snapshots YA se guardan; falta la UI).
- Alertas, exportación PDF, multi-tema, comparación.

---

## Arquitectura actual completa

```
Flujo demo (sin claves):
  page.tsx (cliente) → generateReport(seed) + DEMO_EXECUTIVE → Dashboard

Flujo real (tema ≠ seed):
  page.tsx → POST /api/analyze {topic}
    1. fetchRawArticles(topic)         NewsAPI, 20 artículos EN → NewsApiArticle[]
    2. filterRelevantArticles(...)     regla determinista: topic en title/description
                                       → articulos relevantes + log de descartados
    3. convertArticle(...)             NewsApiArticle[] → RawMention[]
    4. classifyMentions(...)           Haiku, batches de 10, tool-use
    5. saveMentions(...)               InsForge, dedup por id
    6. getMentionsForTopic(...)        histórico del tema (limit 200)
    7. generateReport(...)             motor determinista (capa 1)
    8. synthesizeExecutiveLayer(...)   Sonnet, capa ejecutiva (capa 2, opcional)
    9. saveReportSnapshot(...)         JSONB completo en report_snapshots
  → IntelligenceReport (con .executive si la síntesis funcionó)
```

**Principio de dos capas:** la capa 1 (motor) calcula TODOS los números —
determinista, auditable. La capa 2 (Sonnet) solo los traduce a decisión. El LLM
nunca genera cifras nuevas.

```
src/
├── app/
│   ├── api/analyze/route.ts # pipeline completo (pasos 1-9)
│   ├── layout.tsx           # fuentes, metadata
│   ├── globals.css          # sistema de diseño (tokens @theme)
│   └── page.tsx             # idle → analyzing → done; race fix con refs
├── data/
│   ├── mentions.ts          # SEED_TOPIC + 28 menciones
│   └── executive-demo.ts    # ExecutiveLayer curado para demo
├── lib/
│   ├── types.ts             # modelo de dominio + ExecutiveLayer
│   ├── analysis.ts          # motor determinista (capa 1)
│   ├── insforge.ts          # cliente InsForge server-only lazy
│   ├── db.ts                # saveMentions / getMentionsForTopic / saveReportSnapshot
│   └── ingestion/
│       ├── newsapi.ts       # fetchRawArticles + convertArticle + NewsApiArticle (export)
│       ├── relevance.ts     # filterRelevantArticles: regla determinista title/desc
│       ├── classify.ts      # Haiku: stance/role/scores/tags
│       └── synthesize.ts    # Sonnet: ExecutiveLayer (capa 2)
└── components/
    ├── primitives.tsx       # Panel, SectionHeader, badges, barras
    ├── SearchHero.tsx       # landing (client)
    ├── Analyzing.tsx        # pipeline animado (client) — NO acopla el fetch
    ├── Dashboard.tsx        # compositor; prop demo?: boolean para el banner
    ├── ExecutivePanel.tsx   # MVP 2: brief + positioning + stakeholders
    └── ...                  # paneles MVP 1 (sin cambios)
docs/
└── insforge-setup.sql       # schema mentions + report_snapshots + RLS
```

Variables de entorno (`.env.example`): `INSFORGE_URL`, `INSFORGE_ANON_KEY`,
`NEWSAPI_KEY`, `ANTHROPIC_API_KEY`. Todas server-only.

---

## Qué falta para producción real (en orden)

1. ~~**Proyecto InsForge provisionado**~~ ✅ Proyecto "Quien Opina" (`fa5iq2zk.us-east`), tablas creadas, validado.
2. ~~**Variables de entorno en local**~~ ✅ `.env.local` creado y verificado (gitignored).
3. ~~**Validación end-to-end local**~~ ✅ `OpenAI` analizado el 2026-06-10: 20 menciones, riesgo 83, oportunidad 17, capa ejecutiva completa.
4. ~~**Variables de entorno en Vercel**~~ ✅ Configuradas (pipeline funciona en producción).
5. ~~**Decidir NewsAPI plan**~~ ✅ Resuelto (funciona en producción — plan o configuración activa).
6. ~~**Deploy en Vercel + smoke test**~~ ✅ Validado en producción el 2026-06-10 con `OpenAI` y `Tesla`.

## Riesgos conocidos

- **NewsAPI en producción**: el plan gratuito (Developer) solo permite requests
  desde localhost — en Vercel devolverá 426. Hay que pagar plan o migrar a GNews.
- **NewsAPI solo inglés**: `language: "en"` fijo — temas LATAM en español casi no
  encuentran resultados. Cambiar idioma o hacerlo dinámico.
- **Filtro de relevancia con equivalentes incompletos**: `relevance.ts` cubre "Copa
  Mundial" → ["World Cup", …] y un puñado de casos. Temas nuevos en español sin
  equivalente configurado solo matchean la frase exacta en inglés → muchos descartes
  falsos negativos. Solución: ampliar `EQUIVALENTS` o usar detección de idioma.
- **Timeout del route**: NewsAPI + 2 llamadas Haiku + 1 llamada Sonnet ≈ 10-20 s.
  Vercel Hobby corta en 10 s por defecto → configurar `maxDuration` en el route.
- **`sourceUrl` pendiente**: sin él no hay evidencia clickeable ni citas en la
  capa ejecutiva. Es el cambio más barato con mayor efecto (campo en `Mention`,
  columna `source_url`, conservarlo en classify). Primero del próximo sprint.
- **`max_tokens: 2048` en classify**: justo para batches de 10 — riesgo de
  truncado silencioso (menciones sin clasificar se omiten sin log).
- **Sin auth/rate-limit en `/api/analyze`**: cualquiera puede quemar cuota de
  NewsAPI y crédito de Anthropic con un curl en producción.
- **Scores con datos reales son estimaciones de Haiku** sin grounding (en el seed
  están curados). Comunicar nivel de confianza en el producto (pendiente).
- **Identidad de actor débil con prensa**: `actor = author ?? source.name` →
  mayoría de actores serán medios, no personas.
- **La rec "Regulación" en `analysis.ts` matchea el tag literal en español** —
  con datos reales los tags vienen en inglés y nunca dispara.
- **Cifras de `executive-demo.ts` congeladas** — desfasan si cambia el seed.
- **No correr `npm run build` con el dev server activo** — comparten `.next` y se
  corrompe (error `Cannot find module './447.js'`). Parar el server o `rm -rf .next`.

---

## Qué NO debe reconstruir un futuro Claude

- El sistema de diseño visual — completo y con identidad. No reemplazar con shadcn/ui ni Chakra.
- Los componentes SVG (ScoreGauge, PositioningMatrix, NetworkPreview) — intencionales sin librerías.
- La lógica del motor analítico — no tocar sin leer `src/lib/types.ts` primero.
- La separación de dos capas (motor determinista / síntesis LLM) — el LLM no calcula números.
- La estructura de archivos por capas (data / lib / components).
- El flujo idle → analyzing → done con los refs de sincronización en `page.tsx`.

---

## Visión del producto

QuiénOpina es un **copiloto de inteligencia ejecutiva** para marcas, causas y
personas públicas. Las herramientas de social listening miden volumen y
sentimiento; QuiénOpina mide **peso estratégico** — quién habla, con qué
credibilidad y amplificación, en qué postura, dentro de qué narrativa — y lo
traduce a **decisión**: qué postura adoptar, qué decir, a quién activar.

Las preguntas que responde:
1. ¿Quién habla y qué peso estratégico real tiene?
2. ¿Qué narrativa crece y cuál pierde fuerza?
3. ¿Qué riesgo y qué oportunidad existen, y por qué?
4. ¿Qué postura debería adoptar la organización?
5. ¿Qué debería hacer cada audiencia (board, ejecutivos, empleados, clientes, reguladores, medios)?

**No es social listening. Es Actor Intelligence + juicio ejecutivo.**

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5.8 (strict) |
| Estilos | Tailwind CSS v4 (`@theme` tokens en globals.css) |
| Fuentes | Fraunces (display) + Hanken Grotesk (body) + IBM Plex Mono (datos) |
| Visualizaciones | SVG puro, sin librerías |
| Runtime | React 19 / Node 26 |
| Base de datos | InsForge (`@insforge/sdk`) — Supabase descartado |
| LLM clasificación | `claude-haiku-4-5-20251001` (tool-use, batch) |
| LLM síntesis | `claude-sonnet-4-6` (tool-use, 1 llamado/análisis) |
| Deploy target | Vercel |
| Auth | No hay (pendiente) |

---

## Sistema de diseño

**Nombre de la estética:** "Terminal de Inteligencia Ejecutiva"

**Paleta** (tokens CSS en `globals.css` via `@theme`):
- Fondo: `--color-ink-900` (#07080c), `--color-ink-850`, `--color-ink-800`
- Texto: `--color-bone` (#f4f1ea), `--color-bone-dim`, `--color-muted`
- Acentos: `--color-amber` (#f5a524), `--color-violet` (#9b7bff), `--color-emerald` (#34d399), `--color-rose` (#fb7185)
- Borde: `--color-line` (#232a3d)

**Colores por postura** (`primitives.tsx → STANCE_COLOR`): favorable → emerald,
critical → rose, neutral → bone-dim, ambiguous → amber.
**Colores por postura ejecutiva** (`ExecutivePanel.tsx → POSTURE_COLOR`):
proactiva → emerald, defensiva → rose, neutral → bone-dim.

**Fuentes:** `font-display` = Fraunces, `font-sans` = Hanken Grotesk, `font-mono` = IBM Plex Mono.

**Componente base:** `.panel` — glassmorphism oscuro. Usar siempre `<Panel>` de
`primitives.tsx`. Animaciones: `.rise`, `.growbar`, `.pulse-dot`, `.sweep`.
`"use client"` mínimo: solo `SearchHero`, `Analyzing`, `page.tsx`.

---

## Lógica del motor analítico (`src/lib/analysis.ts`)

- `strategicWeight(m) = 0.34*reach + 0.40*credibility + 0.26*amplification`
- Actor: promedio de pesos + bonus logarítmico `log2(n+1)*4` por persistencia.
  Postura dominante desempata por prioridad: critical > favorable > ambiguous > neutral.
- Momentum narrativo: peso últimos 7 días vs. previo, normalizado a -100..100.
- Risk Score: proporción de peso crítico, amplificada por narrativas críticas en aceleración.
- Opportunity Score: análogo con peso favorable.
- Señales: actor pesado crítico reciente / narrativa crítica con momentum ≥25 / narrativa disputada.
- `generateReport(mentions, topic, now)`: en demo `now` default = `2026-06-05T12:00:00Z`
  (momentum reproducible); el route pasa `new Date()`.

Sobre el seed: 28 menciones del ecosistema Anthropic/Claude. El reporte que
produce: riesgo 35, oportunidad 84, momentum +29, actor top Sam Altman (96.6).

---

## Restricciones a respetar

- **Backend: InsForge** (`@insforge/sdk`), solo dentro de `quien-opina` — no tocar otros proyectos del workspace.
- No agregar librerías de gráficos (recharts, chart.js, d3) sin proponerlo antes.
- Mantener la estética; no usar shadcn/ui sin adaptar.
- `"use client"` mínimo.
- No mergear a `main` ni abrir PR sin aprobación explícita del usuario.

---

## Backlog informal

- `sourceUrl` end-to-end + vista de evidencia (PRÓXIMO — desbloquea citas).
- "Why this score": descomponer risk/opportunity en `ScoreFactor[]` (la fórmula ya lo sabe, solo hay que dejar de descartarlo).
- Input de perspectiva ("¿quién eres frente al tema?") para la síntesis.
- Histórico visible desde `report_snapshots` (datos ya se guardan).
- Comparar dos temas, actor card expandible, export PNG/PDF, i18n, alertas Slack/email, tour demo.

---

## Comandos útiles

```bash
npm run dev      # desarrollo (NO correr build a la vez — corrompe .next)
npm run build    # verificar antes de commit
npm run start    # build de producción local
```

---

# SESSION HANDOFF

**QuiénOpina — resumen en 60 segundos para un Claude nuevo.**

- **Qué es:** copiloto de inteligencia ejecutiva. Motor determinista mide peso
  estratégico de actores/narrativas (capa 1); Sonnet lo traduce a decisión —
  brief CEO, postura recomendada, recomendaciones por stakeholder (capa 2).
- **Estado:** EN PRODUCCIÓN. Pipeline completo validado con `OpenAI` y `Tesla`
  el 2026-06-10. URL: `https://quien-opina.vercel.app`. Commit en prod: `d4f3ccb`.
- **Rama:** `main` (rama de desarrollo `phase-2-supabase-ingestion` ya mergeada).
- **Demo funciona sin claves** (seed + `DEMO_EXECUTIVE` curado). Pipeline real
  requiere las 4 vars en Vercel — ya configuradas y validadas.
- **Filtro de relevancia** (`src/lib/ingestion/relevance.ts`): etapa determinista
  entre fetchRawArticles y classifyMentions. Regla: topic (o equivalentes) debe
  aparecer en title o description. Limitación: equivalentes en `EQUIVALENTS[]`
  son manuales — temas en español sin equivalente configurado pueden perder artículos.
- **Riesgos activos:** timeout >10 s en Vercel Hobby (configurar `maxDuration`);
  `sourceUrl` se descarta (bloquea evidencia clickeable); `/api/analyze` sin auth;
  ingesta solo en inglés (NewsAPI `language: "en"` fijo).
- **Siguiente prioridad:** `sourceUrl` end-to-end (campo en `Mention`, columna en DB,
  conservarlo en classify — desbloquea evidencia clickeable en la capa ejecutiva).
- **Reglas:** leer `src/lib/types.ts` antes de tocar el motor; el LLM nunca
  calcula números; no correr `npm run build` con el dev server vivo; preguntar
  al usuario la prioridad del día antes de escribir código.
