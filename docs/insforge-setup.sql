-- QuiénOpina — InsForge schema
-- Run via: npx @insforge/cli db query --file docs/insforge-setup.sql
-- Or paste into the InsForge dashboard SQL editor.

-- ── mentions ──────────────────────────────────────────────────────────────────
-- One row per classified mention (press article, tweet, etc.) per topic.
-- id is a stable SHA-1 hash of the source URL — re-running the same topic
-- won't insert duplicates.

CREATE TABLE IF NOT EXISTS mentions (
  id                  TEXT        PRIMARY KEY,
  topic               TEXT        NOT NULL,
  actor               TEXT        NOT NULL,
  handle              TEXT,
  role                TEXT        NOT NULL,
  platform            TEXT        NOT NULL,
  text                TEXT        NOT NULL,
  stance              TEXT        NOT NULL,
  reach_score         INTEGER     NOT NULL CHECK (reach_score BETWEEN 0 AND 100),
  credibility_score   INTEGER     NOT NULL CHECK (credibility_score BETWEEN 0 AND 100),
  amplification_score INTEGER     NOT NULL CHECK (amplification_score BETWEEN 0 AND 100),
  date                TIMESTAMPTZ NOT NULL,
  connected_actors    TEXT[]      NOT NULL DEFAULT '{}',
  narrative_tags      TEXT[]      NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mentions_topic_date_idx ON mentions (topic, date DESC);

-- ── report_snapshots ──────────────────────────────────────────────────────────
-- One row per analysis run. Stores the full IntelligenceReport as JSONB.
-- Used for historical trending (Sprint 2). report payloads are ~5-20 KB — safe.

CREATE TABLE IF NOT EXISTS report_snapshots (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic         TEXT        NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL,
  report        JSONB       NOT NULL,
  mention_count INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS snapshots_topic_date_idx ON report_snapshots (topic, generated_at DESC);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Both tables are written only from the server-side API route.
-- Permissive policy for now; tighten when auth is added (Sprint 3).

ALTER TABLE mentions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_mentions"
  ON mentions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_report_snapshots"
  ON report_snapshots FOR ALL USING (true) WITH CHECK (true);
