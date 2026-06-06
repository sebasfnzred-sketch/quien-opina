# QuiénOpina

### Inteligencia de actores estratégicos para marcas, causas y personas públicas.

---

## ¿Qué es QuiénOpina?

QuiénOpina es una plataforma de inteligencia ejecutiva que responde una pregunta que las herramientas tradicionales no responden bien:

**¿Quién realmente importa en la conversación sobre tu marca, y qué deberías hacer al respecto?**

No es un contador de menciones. No es un medidor de sentimiento. Es un sistema de análisis que identifica actores con peso real, detecta qué narrativas están creciendo, mide el riesgo reputacional antes de que escale, y genera recomendaciones concretas para equipos de comunicación, relaciones públicas y estrategia.

---

## El problema que resuelve

Las marcas hoy tienen acceso a toneladas de datos: cuántas veces las mencionaron, en qué tono, en qué plataformas. Pero eso no responde las preguntas que importan en una sala de dirección:

- ¿El periodista que me criticó tiene influencia real o solo volumen?
- ¿La narrativa de "riesgo" que circula en LinkedIn va a llegar a prensa?
- ¿Tengo aliados estratégicos que podría activar para amplificar mi postura?
- ¿Hay una señal temprana que debería atender esta semana antes de que se convierta en crisis?

Las herramientas de social listening miden **volumen y sentimiento**. QuiénOpina mide **peso estratégico e influencia narrativa**. Son preguntas distintas, y la segunda vale mucho más.

---

## Qué diferencia a QuiénOpina del social listening tradicional

| Social listening tradicional | QuiénOpina |
|---|---|
| Cuenta menciones | Pondera el peso de cada actor |
| Mide sentimiento positivo/negativo | Analiza postura estratégica (favorable, crítica, ambigua, neutral) |
| Trata igual a todos los que mencionan | Diferencia un fundador de un usuario anónimo |
| Muestra volumen en el tiempo | Muestra momentum narrativo y velocidad de cambio |
| Genera alertas por picos de menciones | Detecta señales tempranas antes del pico |
| No dice qué hacer | Genera recomendaciones ejecutivas accionables |

---

## Cómo funciona el motor analítico

El corazón de QuiénOpina es un concepto simple pero poderoso: **no todos los que hablan de ti tienen el mismo peso**.

Cada mención que entra al sistema lleva tres atributos:

- **Alcance** — ¿cuánta audiencia potencial tiene este actor?
- **Credibilidad** — ¿qué tan creíble y autorizado es en este dominio?
- **Amplificación** — ¿qué tan probable es que otros repliquen su mensaje?

Con esos tres números calculamos el **peso estratégico** de cada actor. Un investigador respetado con 50,000 seguidores puede tener más peso que una cuenta con un millón de seguidores pero poca credibilidad temática.

A partir de ese peso, el motor construye:

1. **Perfil de actores** — quién habla, desde qué rol, con qué postura y con quién se conecta.
2. **Distribución de postura** — qué porcentaje del *peso* (no del volumen) está siendo favorable, crítico, neutral o ambiguo.
3. **Narrativas y momentum** — qué temas están creciendo en los últimos días versus el periodo anterior.
4. **Scores ejecutivos** — Riesgo (0–100), Oportunidad (0–100) y Momentum narrativo.
5. **Señales tempranas** — actores de alto peso en postura crítica, narrativas que aceleran, campos de batalla donde nadie tiene control del encuadre.
6. **Recomendaciones** — acciones concretas clasificadas en Defensa, Oportunidad y Monitoreo, con prioridad.

---

## Qué hace este MVP

Esta primera versión es una demostración funcional del motor analítico con un caso de ejemplo: **el ecosistema de Anthropic y Claude AI**.

El sistema tiene un dataset de 28 menciones curadas de actores reales del mundo de la inteligencia artificial — periodistas, fundadores, investigadores, reguladores, inversores, competidores, académicos — con sus relaciones, posturas y etiquetas de narrativa.

El dashboard muestra:

- **Resumen ejecutivo** en cuatro puntos, generado automáticamente
- **Scores de Riesgo, Oportunidad y Momentum** con visualizaciones tipo gauge
- **Tabla de actores estratégicos** ordenados por peso, no por volumen
- **Matriz de posicionamiento** — influencia versus postura, en un mapa visual
- **Distribución de postura ponderada** — lo que importa, no lo que es mayoría
- **Narrativas clave** con momentum y postura dominante
- **Red de relaciones** entre los actores principales
- **Señales tempranas de riesgo** clasificadas por severidad
- **Recomendaciones ejecutivas** con prioridad y justificación

---

## Limitaciones actuales

Ser honestos sobre lo que este MVP no hace todavía:

- **No tiene ingesta de datos reales.** El dataset es semilla, curado manualmente para validar el motor.
- **No hay búsqueda por tema.** Cualquier tema que se ingrese corre sobre el mismo dataset de Anthropic/IA.
- **No hay histórico.** El análisis es un snapshot, no una serie de tiempo.
- **No hay usuario ni autenticación.** Es una demo pública sin cuentas.
- **No hay integración con redes sociales, prensa o newsletters.** Eso viene en la siguiente fase.

---

## La visión de largo plazo

QuiénOpina nace con la intención de ser la capa de inteligencia de actores que falta en el mercado latinoamericano y global.

La visión es construir un **Actor Intelligence Dashboard** que cualquier equipo de comunicación, PR, política o estrategia pueda usar para:

- Monitorear en tiempo real qué actores relevantes hablan sobre su marca o causa.
- Entender qué narrativas están ganando tracción y por qué.
- Anticipar crisis reputacionales antes de que exploten.
- Identificar aliados estratégicos y activarlos.
- Comparar su posicionamiento narrativo versus el de sus competidores.
- Exportar reportes ejecutivos listos para presentar.

La próxima fase incluye ingesta real de datos (X, prensa, newsletters), clasificación automática de postura y rol usando IA, y reportes exportables por cliente.

---

## Para probarlo ahora

El demo está disponible en: **[quien-opina.vercel.app](https://quien-opina.vercel.app)** *(próximamente)*

O correlo localmente:

```bash
git clone https://github.com/sebasfnzred-sketch/quien-opina
cd quien-opina
npm install
npm run dev
```

Abre `http://localhost:3000`, ingresa cualquier tema y pulsa **"Generar inteligencia ejecutiva"**.

---

*Construido con Next.js, TypeScript y Tailwind CSS. Sin backend ni base de datos en este MVP.*
*Contacto: sebastian@arqfinance.com*
