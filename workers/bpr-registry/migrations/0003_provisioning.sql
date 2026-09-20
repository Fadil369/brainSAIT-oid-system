-- bpr-registry migration 0003 — Doctor Business Stack provisioning (§8)
CREATE TABLE IF NOT EXISTS bpr_provisioning_log (
  spid TEXT NOT NULL, step TEXT NOT NULL,   -- identity|profile|storefront|commerce|erp
  status TEXT NOT NULL,                     -- done|failed
  detail_json TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (spid, step)
);

CREATE TABLE IF NOT EXISTS bpr_ledger (
  id TEXT PRIMARY KEY, spid TEXT NOT NULL,
  direction TEXT NOT NULL,                  -- credit|debit|payout
  amount_sar INTEGER NOT NULL, ref TEXT,    -- order_id / invoice_id
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ledger_spid ON bpr_ledger(spid);