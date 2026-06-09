# CLAUDE.md — Memoria permanente del proyecto QuiénOpina

Este archivo es la fuente de verdad para cualquier sesión futura de Claude Code.
Léelo completo antes de tocar cualquier archivo del proyecto.

---

## Estado actual

**MVP COMPLETADO.** El proyecto está funcionando, buildea sin errores y está publicado en GitHub.

- GitHub: `https://github.com/sebasfnzred-sketch/quien-opina`
- Vercel: pendiente de deploy (importar desde vercel.com/new — cero configuración requerida)
- Rama principal: `main`

---

## Qué funcionalidades YA EXISTEN (no reconstruir)

- Landing con input de tema y botones de temas sugeridos.
- Pantalla de "analizando" con pipeline de pasos animados.
- Dashboard ejecutivo completo con 8 paneles:
  - KPIs: Riesgo, Oportunidad, Momentum, Cobertura.
  - Resumen ejecutivo en 4 puntos generado automáticamente.
  - Tabla de actores ordenados por peso estratégico.
  - Distribución de postura ponderada (no por volumen).
  - Matriz de posicionamiento SVG (influencia × postura).
  - Narrativas con momentum y composición de postura.
  - Red de actores (layout radial SVG).
  - Señales tempranas de riesgo por severidad.
  - Recomendaciones ejecutivas (defensa / oportunidad / monitoreo).
- Banner de "Modo demostración" visible arriba del dashboard.
- Motor analítico completo (`src/lib/analysis.ts`): peso estratégico, momentum, risk score, opportunity score, señales, recomendaciones.
- Dataset semilla de 28 menciones curadas (caso Anthropic / Claude AI).
- Sistema de diseño completo: tokens, fuentes, animaciones, componentes base.

## Qué NO existe todavía

- Ingesta de datos reales (X, prensa, RSS, newsletters).
- Backend ni base de datos.
- Autenticación ni cuentas de usuario.
- Búsqueda real por tema (todos los temas corren sobre el mismo dataset semilla).
- Histórico de análisis o series de tiempo.
- Exportación a PDF.
- Alertas por email o Slack.

---

## Próxima prioridad absoluta

**Integración de datos reales por tema.**

Pasos concretos:
1. Conectar X API v2 para recuperar tweets por keyword.
2. Conectar NewsAPI o GNews para prensa.
3. Clasificar postura y rol de cada mención con Claude API (claude-sonnet-4-6) por batch.
4. Persistir menciones en base de datos (InsForge).
5. Pasar el dataset real a `generateReport` en lugar del semilla.

---

## Qué NO debe reconstruir un futuro Claude

- El sistema de diseño visual — está completo y tiene identidad propia. No reemplazar con shadcn/ui ni Chakra.
- Los componentes SVG (ScoreGauge, PositioningMatrix, NetworkPreview) — son intencionales sin librerías.
- La lógica del motor analítico — no tocar sin entender el modelo de dominio en `src/lib/types.ts` primero.
- La estructura de archivos — está organizada por capas (data / lib / components). Mantenerla.
- El flujo idle → analyzing → done en `page.tsx` — funciona bien tal como está.

---

## Cómo debe iniciar una nueva sesión

1. Leer este archivo completo.
2. Ejecutar `npm run dev` y abrir `http://localhost:3000` para ver el estado visual actual.
3. Revisar `src/lib/types.ts` para entender el modelo de dominio antes de cualquier cambio.
4. Confirmar con el usuario cuál es la prioridad del día antes de escribir código.

---

## Visión del producto

QuiénOpina es una plataforma de **inteligencia de actores estratégicos** para marcas, causas y personas públicas.

La propuesta de valor central: las herramientas tradicionales de social listening miden volumen y sentimiento. QuiénOpina mide **peso estratégico** — quién habla, qué credibilidad tiene, con qué amplificación, en qué postura, dentro de qué narrativa.

Las cinco preguntas que el producto responde:
1. ¿Quién habla?
2. ¿Qué dice?
3. ¿Con quién se conecta?
4. ¿Qué actores tienen peso estratégico real?
5. ¿Qué riesgos reputacionales u oportunidades narrativas existen?

**No es social listening. Es Actor Intelligence.**

---

## Estado actual (junio 2026)

- MVP funcional y deployable.
- Demo con dataset semilla de 28 menciones curadas (caso Anthropic / Claude AI).
- Motor analítico completamente implementado (sin datos reales todavía).
- Frontend tipo dashboard ejecutivo premium.
- Repositorio público en GitHub: `https://github.com/sebasfnzred-sketch/quien-opina`
- Pendiente de deploy en Vercel.

**Lo que NO existe todavía:**
- Ingesta de datos reales (X, prensa, newsletters, RSS).
- Backend ni base de datos.
- Autenticación ni cuentas de usuario.
- Búsqueda real por tema (cualquier tema corre sobre el mismo dataset semilla).
- Histórico de análisis.
- Exportación de reportes a PDF.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript 5.8 (strict mode) |
| Estilos | Tailwind CSS v4 (postcss plugin, `@theme` tokens) |
| Fuentes | Fraunces (display serif) + Hanken Grotesk (sans body) + IBM Plex Mono (datos) |
| Visualizaciones | SVG puro, sin librerías de gráficos |
| Runtime | React 19 / Node 26 |
| Deploy target | Vercel (static export via Next.js) |
| Base de datos | InsForge (`@insforge/sdk`) — Supabase descartado por límite de proyectos gratuitos |
| Sin auth | Sin cuentas de usuario por ahora |

---

## Arquitectura de archivos

```
src/
├── app/
│   ├── layout.tsx          # fuentes Google (variables CSS), metadata, globals
│   ├── globals.css         # sistema de diseño completo (tokens, clases utilitarias, animaciones)
│   └── page.tsx            # orquesta el flujo: idle → analyzing → done
│
├── data/
│   └── mentions.ts         # SEED_TOPIC + 28 menciones tipadas (Mention[])
│
├── lib/
│   ├── types.ts            # TODO el modelo de dominio — leer antes de cualquier cambio
│   └── analysis.ts         # motor de inteligencia completo
│
└── components/
    ├── primitives.tsx       # StanceBadge, ScoreBar, Tag, MomentumPill, SectionHeader, Panel
    ├── SearchHero.tsx       # landing + input (client component)
    ├── Analyzing.tsx        # pantalla de "procesando" con steps animados (client)
    ├── Dashboard.tsx        # compositor: monta todos los paneles en orden
    ├── KpiStrip.tsx         # 4 KPIs: riesgo, oportunidad, momentum, cobertura
    ├── ScoreGauge.tsx       # gauge SVG semicircular para scores 0–100
    ├── ExecutiveSummary.tsx # resumen en 4 puntos con énfasis **negrita** sin markdown lib
    ├── StancePanel.tsx      # distribución de postura ponderada (barras)
    ├── ActorTable.tsx       # tabla de actores por peso estratégico
    ├── PositioningMatrix.tsx# SVG: influencia (eje Y) × postura (eje X) con cuadrantes
    ├── NarrativePanel.tsx   # narrativas con barra de composición de postura + momentum pill
    ├── NetworkPreview.tsx   # red radial SVG: nodo central + anillo de actores
    ├── WarningsPanel.tsx    # señales tempranas con severidad (alta/media/baja)
    └── RecommendationsPanel.tsx # cards de recomendaciones (defensa/oportunidad/monitoreo)
```

---

## Sistema de diseño

**Nombre de la estética:** "Terminal de Inteligencia Ejecutiva"

**Paleta de colores** (tokens CSS en `globals.css` via `@theme`):
- Fondo: `--color-ink-900` (#07080c), `--color-ink-850` (#0a0c12), `--color-ink-800` (#0e111a)
- Texto: `--color-bone` (#f4f1ea), `--color-bone-dim` (#b9bccb), `--color-muted` (#757d96)
- Acentos: `--color-amber` (#f5a524), `--color-violet` (#9b7bff), `--color-emerald` (#34d399), `--color-rose` (#fb7185)
- Borde: `--color-line` (#232a3d)

**Colores por postura** (definidos en `primitives.tsx → STANCE_COLOR`):
- favorable → emerald, critical → rose, neutral → bone-dim, ambiguous → amber

**Fuentes:**
- `font-display` = Fraunces (titulares, números grandes)
- `font-sans` (body, default) = Hanken Grotesk
- `font-mono` = IBM Plex Mono (métricas, etiquetas, badges)

**Componente base:** `.panel` — glassmorphism oscuro con borde fino y brillo superior de 1px. Siempre usar `<Panel>` de `primitives.tsx`, no crear divs manuales con esos estilos.

**Animaciones:**
- `.rise` — entrada con fade + translateY (escalonada con `animationDelay`)
- `.growbar` — barras que crecen desde 0 al cargar
- `.pulse-dot` — indicador de "en vivo"
- `.sweep` — barrido de luz en la barra de progreso de Analyzing

**Principio:** fondo oscuro, acentos luminosos con `box-shadow` de color (`0 0 12px color`). El grano y los gradientes radiales de fondo están en `body` vía CSS.

---

## Lógica del motor analítico (`src/lib/analysis.ts`)

### Peso estratégico de una mención
```
strategicWeight(m) = 0.34 * reachScore + 0.40 * credibilityScore + 0.26 * amplificationScore
```
La credibilidad pesa más que el alcance porque un actor creíble mueve narrativa aunque tenga menos audiencia.

### Perfil de actor agregado
- Promedio de pesos de sus menciones.
- Bonus logarítmico por persistencia: `log2(n+1) * 4` donde n = número de menciones. Aparece varias veces = refuerza, pero no linealmente.
- Postura dominante: desempata por prioridad de señal (critical > favorable > ambiguous > neutral).

### Momentum narrativo de una narrativa
- Compara el peso estratégico de las menciones de los últimos 7 días vs. el período anterior.
- Fórmula: `((recentWeight - priorWeight) / totalWeight) * 100`
- Rango: -100..100.

### Risk Score
- Proporción de peso crítico sobre peso total.
- Amplificado por narrativas críticas con momentum positivo.

### Opportunity Score
- Proporción de peso favorable sobre peso total.
- Amplificado por narrativas favorables en ascenso.

### Señales tempranas
Tres tipos que se detectan automáticamente:
1. Actor de alto peso (>70) con postura crítica en los últimos 10 días.
2. Narrativa crítica con momentum ≥ 25.
3. "Campo de batalla": narrativa con ≥2 menciones favorables Y ≥2 críticas y peso ≥ 55.

### Recomendaciones
Derivadas de los scores, narrativas y señales. Tipos: `defensa | oportunidad | monitoreo`. Prioridad 1–3.

### Determinismo
`generateReport` acepta una fecha de referencia (`now: Date`). En demo usa `2026-06-05T12:00:00Z` para que el momentum sea reproducible. En producción, pasar `new Date()`.

---

## Dataset semilla (`src/data/mentions.ts`)

28 menciones del ecosistema Anthropic / Claude AI. Actores incluidos:
- Fundadores: Dario Amodei, Jack Clark, Sam Altman (competidor), Founder startup IA
- Periodistas: Casey Newton, Kara Swisher, TechCrunch, The Information
- Investigadores: Yoshua Bengio, Yann LeCun, Andrej Karpathy, Margaret Mitchell, Investigador Red Team
- Académicos: Gary Marcus, Ethan Mollick
- Reguladores: Senadora Comisión IA, Comisión Europea IA
- Inversores/Analistas: ARK Invest, Analista Morgan Stanley, CISO Fortune 500, Benedict Evans
- Competidores: Sundar Pichai, Satya Nadella, Mistral AI
- Creadores: Simon Willison, Lex Fridman, Reddit r/LocalLLaMA

Cada mención tiene: `id, actor, handle, role, platform, text, stance, reachScore (0-100), credibilityScore (0-100), amplificationScore (0-100), date, connectedActors[], narrativeTags[]`.

---

## Decisiones de diseño importantes

1. **Sin librerías de gráficos** — todos los SVG son manuales (ScoreGauge, PositioningMatrix, NetworkPreview). Razón: cero dependencias extra, control total sobre el estilo.

2. **Tailwind v4** — usa `@theme` en lugar de `tailwind.config.js`. Las clases de color custom no se mapean como en v3. Si algo parece raro en el CSS, verificar que los tokens estén en `globals.css @theme`.

3. **`"use client"` mínimo** — solo `SearchHero`, `Analyzing` y `page.tsx` son client components. El resto son server components por defecto.

4. **Motor 100% client-side** — `generateReport` corre en el cliente, no en un API route. Esto simplifica el deploy (Vercel static) pero significa que no hay cacheo de reportes.

5. **Postura dominante ≠ mayoría** — el sistema desempata por prioridad de señal, no por conteo puro. Un actor crítico puede dominar aunque haya más menciones favorables si tiene mayor peso.

6. **Fecha fija en demo** — `generateReport` usa `2026-06-05` como `now` para que el momentum narrativo sea consistente y predecible en la demo. Al integrar datos reales, cambiar a `new Date()`.

---

## Flujo de la aplicación (`page.tsx`)

```
Phase: "idle"     → SearchHero (input de tema)
Phase: "analyzing" → Analyzing (pipeline simulado ~3 segundos)
Phase: "done"     → Dashboard (reporte completo)
```

El reporte se genera con `useMemo` — si el usuario cambia el tema y vuelve a generar, se recalcula. El botón "← Analizar otro tema" en el header vuelve a `idle`.

---

## Roadmap de features (próximas 3 prioridades)

### Prioridad 1 — Ingesta real de datos
Conectar fuentes reales por tema:
- X (Twitter) API v2 para tweets recientes.
- RSS de prensa (NewsAPI, GNews o scraping de cabeceras LATAM).
- Newsletters vía Beehiiv o substack RSS.
- Clasificador de postura y rol con Claude API (claude-sonnet-4-6) por batch.
- Almacenar menciones en base de datos (InsForge).

### Prioridad 2 — Series de tiempo y alertas
- Guardar snapshots del reporte por fecha por tema.
- Graficar evolución del Risk Score y momentum a lo largo del tiempo.
- Alertas por email/Slack cuando una narrativa crítica supera umbral de aceleración.

### Prioridad 3 — Reportes exportables y multi-tema
- Guardar análisis por cliente/proyecto.
- Comparar dos temas/marcas en una vista side-by-side.
- Exportar reporte ejecutivo a PDF (con Puppeteer o react-pdf).
- Añadir autenticación básica (NextAuth o Clerk).

---

## Restricciones actuales a respetar

- **Backend de QuiénOpina: InsForge.** Este proyecto usa InsForge (`@insforge/sdk`) como backend y capa de persistencia. Supabase fue descartado porque no había proyectos gratuitos disponibles. InsForge se aplica únicamente dentro del repo `quien-opina` — no modifica ni interfiere con otros proyectos del workspace.
- No agregar librerías de gráficos (recharts, chart.js, d3) — mantener SVG manual o proponer al usuario antes de instalar.
- Mantener la estética "Terminal de Inteligencia Ejecutiva" — no usar componentes genéricos como shadcn/ui sin adaptarlos al sistema de diseño existente.
- El `"use client"` debe ser mínimo. No convertir componentes a cliente sin necesidad.

---

## Ideas pendientes (backlog informal)

- Modo "comparar dos temas" en pantalla dividida.
- "Actor card" expandible al hacer click en la tabla (menciones individuales del actor).
- Exportar la red de actores como imagen PNG.
- Input de URL para analizar un hilo de X o un artículo de prensa puntual.
- Modo oscuro / claro (actualmente solo dark mode).
- Internacionalización (inglés para mercado global).
- Webhook de Slack para recibir el resumen ejecutivo diario.
- Demo guiada (tour) para primeros visitantes.

---

## Comandos útiles

```bash
npm run dev      # desarrollo en http://localhost:3000
npm run build    # verificar que compila sin errores antes de commit
npm run start    # servir el build de producción localmente
```

Deploy:
```bash
# Vercel CLI
npm i -g vercel && vercel --prod

# O desde vercel.com/new → importar github.com/sebasfnzred-sketch/quien-opina
```

Git:
```bash
git add . && git commit -m "..." && git push
```

---

# SESSION HANDOFF

**QuiénOpina — resumen en 60 segundos para un Claude nuevo.**

- **Qué es:** Dashboard de inteligencia de actores estratégicos. No mide menciones: mide peso estratégico (alcance × credibilidad × amplificación) de cada actor para identificar quién importa, qué narrativa crece y qué riesgo hay.
- **Estado:** MVP COMPLETADO. Build limpio, código en GitHub (`https://github.com/sebasfnzred-sketch/quien-opina`), deploy en Vercel pendiente de activar.
- **Stack:** Next.js 15 + TypeScript + Tailwind v4. Sin backend, sin DB, sin auth. Todo corre en cliente.
- **Lo que existe:** landing → pantalla de análisis → dashboard ejecutivo con 8 paneles (KPIs, actores, narrativas, red, señales, recomendaciones). Motor analítico real en `src/lib/analysis.ts`. Dataset semilla de 28 menciones (caso Anthropic/IA).
- **Lo que NO existe:** datos reales, backend, auth, búsqueda real por tema, histórico, exportación.
- **Prioridad absoluta siguiente:** ingesta de datos reales por tema vía NewsAPI + Claude API para clasificación de postura/rol.
- **Restricción clave:** el backend usa **InsForge** (`@insforge/sdk`), aplicado únicamente dentro de `quien-opina`. No agregar librerías de gráficos. Mantener el sistema de diseño "Terminal de Inteligencia Ejecutiva".
- **Para empezar:** leer este archivo → `npm run dev` → revisar `src/lib/types.ts` → preguntar al usuario qué quiere hacer hoy.
