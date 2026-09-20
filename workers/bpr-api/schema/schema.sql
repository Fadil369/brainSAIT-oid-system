-- BrainSAIT Provider Registry (BPR) D1 schema
-- OID root: 1.3.6.1.4.1.61026 (IANA PEN 61026 = BRAINSAIT LTD)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  display_name TEXT,
  gravatar_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK(purpose IN ('login','verify_email')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS providers (
  spid TEXT PRIMARY KEY,              -- e.g. SA-PHY-000001
  oid TEXT NOT NULL UNIQUE,            -- e.g. 1.3.6.1.4.1.61026.3.1.000001
  provider_type TEXT NOT NULL,         -- physician|dentist|pharmacist|nurse|allied-health|technician|other
  name_english TEXT NOT NULL,
  name_arabic TEXT,
  title_en TEXT,
  title_ar TEXT,
  specialty TEXT,
  subspecialty TEXT,
  gender TEXT CHECK(gender IN ('male','female','other','unknown')),
  date_of_birth TEXT,                  -- ISO YYYY-MM-DD, nullable
  primary_email TEXT,
  primary_phone_e164 TEXT,
  bio_en TEXT,
  bio_ar TEXT,
  website_url TEXT,
  orcid TEXT,
  npi TEXT,                            -- optional US NPI mapping
  scfhs_file_number TEXT,
  gravatar_email TEXT,
  owner_user_id TEXT REFERENCES users(id),
  profile_status TEXT NOT NULL DEFAULT 'draft' CHECK(profile_status IN ('draft','pending_review','published','suspended','archived')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK(verification_status IN ('unverified','partial','verified','contested')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_providers_owner ON providers(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_providers_specialty ON providers(specialty);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(profile_status);

CREATE TABLE IF NOT EXISTS provider_identifiers (
  id TEXT PRIMARY KEY,
  spid TEXT NOT NULL REFERENCES providers(spid) ON DELETE CASCADE,
  system TEXT NOT NULL,                -- e.g. SCFHS, NPI, ORCID, DID, BRAINSAIT_OID
  value TEXT NOT NULL,
  display TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  source TEXT,                         -- provenance label
  issued_at TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(spid, system, value)
);
CREATE INDEX IF NOT EXISTS idx_provider_identifiers_spid ON provider_identifiers(spid);

CREATE TABLE IF NOT EXISTS provider_locations (
  id TEXT PRIMARY KEY,
  spid TEXT NOT NULL REFERENCES providers(spid) ON DELETE CASCADE,
  organization_name_en TEXT,
  organization_name_ar TEXT,
  facility_oid TEXT,                   -- optional 1.3.6.1.4.1.61026.2.* reference
  role_en TEXT,                        -- e.g. Consultant Cardiologist
  role_ar TEXT,
  city TEXT,
  region TEXT,
  country TEXT NOT NULL DEFAULT 'SA',
  address_line1 TEXT,
  postal_code TEXT,
  latitude REAL,
  longitude REAL,
  phone_e164 TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_provider_locations_spid ON provider_locations(spid);

CREATE TABLE IF NOT EXISTS verification_claims (
  id TEXT PRIMARY KEY,
  spid TEXT NOT NULL REFERENCES providers(spid) ON DELETE CASCADE,
  claim_type TEXT NOT NULL,            -- identity|scfhs_registration|specialty|affiliation|degree|good_standing|language
  issuer TEXT NOT NULL,                -- SCFHS, Hospital X, University Y, BrainSAIT
  subject_field TEXT,                  -- which field this claim attests (nullable)
  status TEXT NOT NULL CHECK(status IN ('verified','expired','revoked','pending','contested')),
  evidence_url TEXT,
  evidence_hash TEXT,
  issued_at TEXT NOT NULL,
  expires_at TEXT,
  last_checked_at TEXT,
  created_by_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_verification_claims_spid ON verification_claims(spid);
CREATE INDEX IF NOT EXISTS idx_verification_claims_type ON verification_claims(claim_type);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  action TEXT NOT NULL,                -- create|update|delete|verify|revoke|login|logout
  resource_type TEXT NOT NULL,         -- user|provider|claim|session
  resource_id TEXT,
  metadata TEXT,                       -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_user_id);

-- Sequence helpers for SPID allocation (per type). We store the next available number per provider_type.
CREATE TABLE IF NOT EXISTS spid_sequences (
  provider_type TEXT PRIMARY KEY,
  next_num INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO spid_sequences(provider_type, next_num) VALUES
  ('physician', 1), ('dentist', 1), ('pharmacist', 1),
  ('nurse', 1), ('allied-health', 1), ('technician', 1), ('other', 1);


-- BrainSAIT Provider Registry (BPR) D1 schema
-- OID root: 1.3.6.1.4.1.61026 (IANA PEN 61026 = BRAINSAIT LTD)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  display_name TEXT,
  gravatar_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK(purpose IN ('login','verify_email')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS providers (
  spid TEXT PRIMARY KEY,              -- e.g. SA-PHY-000001
  oid TEXT NOT NULL UNIQUE,            -- e.g. 1.3.6.1.4.1.61026.3.1.000001
  provider_type TEXT NOT NULL,         -- physician|dentist|pharmacist|nurse|allied-health|technician|other
  name_english TEXT NOT NULL,
  name_arabic TEXT,
  title_en TEXT,
  title_ar TEXT,
  specialty TEXT,
  subspecialty TEXT,
  gender TEXT CHECK(gender IN ('male','female','other','unknown')),
  date_of_birth TEXT,                  -- ISO YYYY-MM-DD, nullable
  primary_email TEXT,
  primary_phone_e164 TEXT,
  bio_en TEXT,
  bio_ar TEXT,
  website_url TEXT,
  orcid TEXT,
  npi TEXT,                            -- optional US NPI mapping
  scfhs_file_number TEXT,
  gravatar_email TEXT,
  owner_user_id TEXT REFERENCES users(id),
  profile_status TEXT NOT NULL DEFAULT 'draft' CHECK(profile_status IN ('draft','pending_review','published','suspended','archived')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK(verification_status IN ('unverified','partial','verified','contested')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_providers_owner ON providers(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_providers_specialty ON providers(specialty);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(profile_status);

CREATE TABLE IF NOT EXISTS provider_identifiers (
  id TEXT PRIMARY KEY,
  spid TEXT NOT NULL REFERENCES providers(spid) ON DELETE CASCADE,
  system TEXT NOT NULL,                -- e.g. SCFHS, NPI, ORCID, DID, BRAINSAIT_OID
  value TEXT NOT NULL,
  display TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  source TEXT,                         -- provenance label
  issued_at TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(spid, system, value)
);
CREATE INDEX IF NOT EXISTS idx_provider_identifiers_spid ON provider_identifiers(spid);

CREATE TABLE IF NOT EXISTS provider_locations (
  id TEXT PRIMARY KEY,
  spid TEXT NOT NULL REFERENCES providers(spid) ON DELETE CASCADE,
  organization_name_en TEXT,
  organization_name_ar TEXT,
  facility_oid TEXT,                   -- optional 1.3.6.1.4.1.61026.2.* reference
  role_en TEXT,                        -- e.g. Consultant Cardiologist
  role_ar TEXT,
  city TEXT,
  region TEXT,
  country TEXT NOT NULL DEFAULT 'SA',
  address_line1 TEXT,
  postal_code TEXT,
  latitude REAL,
  longitude REAL,
  phone_e164 TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_provider_locations_spid ON provider_locations(spid);

CREATE TABLE IF NOT EXISTS verification_claims (
  id TEXT PRIMARY KEY,
  spid TEXT NOT NULL REFERENCES providers(spid) ON DELETE CASCADE,
  claim_type TEXT NOT NULL,            -- identity|scfhs_registration|specialty|affiliation|degree|good_standing|language
  issuer TEXT NOT NULL,                -- SCFHS, Hospital X, University Y, BrainSAIT
  subject_field TEXT,                  -- which field this claim attests (nullable)
  status TEXT NOT NULL CHECK(status IN ('verified','expired','revoked','pending','contested')),
  evidence_url TEXT,
  evidence_hash TEXT,
  issued_at TEXT NOT NULL,
  expires_at TEXT,
  last_checked_at TEXT,
  created_by_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_verification_claims_spid ON verification_claims(spid);
CREATE INDEX IF NOT EXISTS idx_verification_claims_type ON verification_claims(claim_type);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  action TEXT NOT NULL,                -- create|update|delete|verify|revoke|login|logout
  resource_type TEXT NOT NULL,         -- user|provider|claim|session
  resource_id TEXT,
  metadata TEXT,                       -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_user_id);

-- Sequence helpers for SPID allocation (per type). We store the next available number per provider_type.
CREATE TABLE IF NOT EXISTS spid_sequences (
  provider_type TEXT PRIMARY KEY,
  next_num INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO spid_sequences(provider_type, next_num) VALUES
  ('physician', 1), ('dentist', 1), ('pharmacist', 1),
  ('nurse', 1), ('allied-health', 1), ('technician', 1), ('other', 1);