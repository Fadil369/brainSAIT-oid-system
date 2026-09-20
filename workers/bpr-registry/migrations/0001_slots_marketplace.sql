-- bpr-registry migration 0001 — slots marketplace (spec §1)
-- Idempotent: all IF NOT EXISTS. No changes to existing tables.

CREATE TABLE IF NOT EXISTS bpr_counters (
  kind TEXT PRIMARY KEY,
  next INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bpr_slots (
  id            TEXT PRIMARY KEY,
  org_spid      TEXT NOT NULL,
  parent_slot   TEXT,
  slot_type     TEXT NOT NULL,
  specialty     TEXT NOT NULL,
  title         TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  requirements_json TEXT,
  price_integration_sar INTEGER NOT NULL,
  price_monthly_sar     INTEGER NOT NULL,
  state         TEXT NOT NULL DEFAULT 'empty',
  holder_spid   TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  FOREIGN KEY (org_spid) REFERENCES bpr_memberships(spid)
);
CREATE INDEX IF NOT EXISTS idx_slots_search ON bpr_slots(state, slot_type, specialty);
CREATE INDEX IF NOT EXISTS idx_slots_org ON bpr_slots(org_spid);

CREATE TABLE IF NOT EXISTS bpr_slot_requests (
  id           TEXT PRIMARY KEY,
  slot_id      TEXT NOT NULL REFERENCES bpr_slots(id),
  requester_spid TEXT NOT NULL,
  message      TEXT,
  state        TEXT NOT NULL DEFAULT 'requested',
  order_id     TEXT,
  created_at   TEXT NOT NULL,
  resolved_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_requests_slot ON bpr_slot_requests(slot_id, state);

CREATE TABLE IF NOT EXISTS bpr_delegations (
  id            TEXT PRIMARY KEY,
  from_spid     TEXT NOT NULL,
  to_spid       TEXT NOT NULL,
  slot_id       TEXT NOT NULL REFERENCES bpr_slots(id),
  scope_json    TEXT NOT NULL,
  consent_sig   TEXT,
  state         TEXT NOT NULL DEFAULT 'active',
  created_at    TEXT NOT NULL
);
