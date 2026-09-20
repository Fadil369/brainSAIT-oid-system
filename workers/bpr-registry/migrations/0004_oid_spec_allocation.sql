-- 0004: spec-compliant OID allocation (Master Spec §4/§5/§7, validated 2026-09-04)
-- Members get OIDs from the VALIDATED tree: <root>.<jurisdiction arc>.<class arc>.<branch seq>.
-- Retires the never-registered arcs 20–23. Sequences are per (jurisdiction, class branch).

ALTER TABLE bpr_memberships ADD COLUMN oid TEXT;

-- Backfill existing members (deterministic: branch order by registration).
UPDATE bpr_memberships SET oid = '1.3.6.1.4.1.61026.2.3.1' WHERE spid = 'SA-PHY-000001';
UPDATE bpr_memberships SET oid = '1.3.6.1.4.1.61026.2.3.2' WHERE spid = 'SA-PHY-000002';
UPDATE bpr_memberships SET oid = '1.3.6.1.4.1.61026.2.3.3' WHERE spid = 'SA-PHA-000001';
UPDATE bpr_memberships SET oid = '1.3.6.1.4.1.61026.2.2.1' WHERE spid = 'SA-ORG-000001';

-- Seed branch counters (next value to allocate).
INSERT INTO bpr_counters (kind, next) VALUES ('oid-sa-2-3', 4) ON CONFLICT(kind) DO NOTHING;
INSERT INTO bpr_counters (kind, next) VALUES ('oid-sa-2-2', 2) ON CONFLICT(kind) DO NOTHING;
