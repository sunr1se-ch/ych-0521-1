CREATE TABLE IF NOT EXISTS umbrella (
  id TEXT PRIMARY KEY,
  umbrella_no TEXT NOT NULL UNIQUE,
  planned_interval_days INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'normal',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS pasting_record (
  id TEXT PRIMARY KEY,
  umbrella_id TEXT NOT NULL,
  pasting_date DATE NOT NULL,
  wrinkle_length REAL NOT NULL,
  interval_days INTEGER,
  wrinkle_increase REAL,
  is_stagnant_trigger BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (umbrella_id) REFERENCES umbrella(id)
);

CREATE TABLE IF NOT EXISTS stagnation_record (
  id TEXT PRIMARY KEY,
  umbrella_id TEXT NOT NULL,
  triggered_by_record_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  stagnant_date DATE NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT 0,
  resolved_at DATETIME,
  resolution_note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (umbrella_id) REFERENCES umbrella(id),
  FOREIGN KEY (triggered_by_record_id) REFERENCES pasting_record(id)
);

CREATE INDEX IF NOT EXISTS idx_pasting_record_umbrella ON pasting_record(umbrella_id);
CREATE INDEX IF NOT EXISTS idx_stagnation_record_umbrella ON stagnation_record(umbrella_id);
CREATE INDEX IF NOT EXISTS idx_stagnation_record_resolved ON stagnation_record(resolved);
CREATE INDEX IF NOT EXISTS idx_umbrella_status ON umbrella(status);
