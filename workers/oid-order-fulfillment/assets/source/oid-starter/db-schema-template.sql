-- BrainSAIT OID Database Schema Templates
-- IANA PEN 61026 — 1.3.6.1.4.1.61026

CREATE TABLE IF NOT EXISTS healthcare_records (
  id            BIGSERIAL PRIMARY KEY,
  oid_path      VARCHAR(128) NOT NULL
    CHECK (oid_path LIKE '1.3.6.1.4.1.61026.3%'),
  resource_type VARCHAR(64)  NOT NULL,
  resource_id   VARCHAR(128) NOT NULL,
  fhir_version  VARCHAR(8)   DEFAULT 'R4',
  nphies_org    VARCHAR(64),
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW(),
  UNIQUE (oid_path, resource_id)
);

CREATE INDEX idx_healthcare_records_oid ON healthcare_records (oid_path);
CREATE INDEX idx_healthcare_records_type ON healthcare_records (resource_type);

CREATE TABLE IF NOT EXISTS ai_agents (
  id          BIGSERIAL PRIMARY KEY,
  oid_path    VARCHAR(128) NOT NULL
    CHECK (oid_path LIKE '1.3.6.1.4.1.61026.3.3%'),
  agent_id    VARCHAR(128) UNIQUE NOT NULL,
  agent_name  VARCHAR(256) NOT NULL,
  mcp_urn     VARCHAR(256) GENERATED ALWAYS AS ('urn:oid:' || oid_path) STORED,
  version     VARCHAR(32)  DEFAULT '1.0.0',
  active      BOOLEAN      DEFAULT TRUE,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iot_devices (
  id          BIGSERIAL PRIMARY KEY,
  oid_path    VARCHAR(128) NOT NULL
    CHECK (oid_path LIKE '1.3.6.1.4.1.61026.4%'),
  device_id   VARCHAR(128) UNIQUE NOT NULL,
  asset_tag   VARCHAR(64),
  location    VARCHAR(256),
  last_seen   TIMESTAMPTZ,
  qr_payload  JSONB,
  active      BOOLEAN DEFAULT TRUE,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oid_licenses (
  id            BIGSERIAL PRIMARY KEY,
  license_key   VARCHAR(64) UNIQUE NOT NULL,
  oid_path      VARCHAR(128) NOT NULL
    CHECK (oid_path LIKE '1.3.6.1.4.1.61026.2%'),
  holder_email  VARCHAR(256) NOT NULL,
  product_sku   VARCHAR(64)  NOT NULL,
  issued_at     TIMESTAMPTZ  DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  max_activations INTEGER DEFAULT 1,
  active_count    INTEGER DEFAULT 0,
  status        VARCHAR(32) DEFAULT 'Active'
    CHECK (status IN ('Active', 'Expired', 'Revoked', 'Pending'))
);

CREATE INDEX idx_oid_licenses_key ON oid_licenses (license_key);
CREATE INDEX idx_oid_licenses_email ON oid_licenses (holder_email);
