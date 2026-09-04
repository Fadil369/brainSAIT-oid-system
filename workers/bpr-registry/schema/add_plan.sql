ALTER TABLE providers ADD COLUMN plan_tier TEXT CHECK(plan_tier IN ('free','annual','monthly')) DEFAULT 'free';
ALTER TABLE providers ADD COLUMN plan_status TEXT CHECK(plan_status IN ('pending','active','suspended','expired','none')) DEFAULT 'none';
ALTER TABLE providers ADD COLUMN plan_expires_at TEXT;
