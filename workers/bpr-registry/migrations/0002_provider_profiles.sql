-- bpr-registry migration 0002 — provider public profiles (the 6 W's)
CREATE TABLE IF NOT EXISTS bpr_profiles (
  spid          TEXT PRIMARY KEY,          -- FK → bpr_memberships.spid
  headline      TEXT,                      -- "Emergency Medicine Operator"
  bio           TEXT,
  services_json TEXT,                      -- WHAT he provides: ["ER night coverage", ...]
  modes_json    TEXT,                      -- HOW: ["on_site", "telehealth", "voice"]
  locations_json TEXT,                     -- WHERE: [{org, city, branch}]
  availability_json TEXT,                  -- WHEN: {shifts, days, response_time}
  team_json     TEXT,                      -- WHO assists: [{role, count, source}]
  pricing_json  TEXT,                      -- HOW MUCH: {integration_sar, monthly_sar, per_encounter_sar, notes}
  updated_at    TEXT NOT NULL
);
