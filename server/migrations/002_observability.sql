CREATE TABLE IF NOT EXISTS operational_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'error',
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  source TEXT,
  status_code INTEGER,
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS operational_events_type_created_idx
  ON operational_events(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS job_runs_name_started_idx
  ON job_runs(job_name, started_at DESC);

CREATE TABLE IF NOT EXISTS widget_config_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  widget_config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS widget_config_snapshots_store_created_idx
  ON widget_config_snapshots(store_id, created_at DESC);
