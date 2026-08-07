-- Initialize the OID database schema
CREATE TABLE IF NOT EXISTS oids (
    id SERIAL PRIMARY KEY,
    oid VARCHAR(50) NOT NULL UNIQUE,
    full_oid VARCHAR(100) NOT NULL UNIQUE,
    parent_oid VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    access_level VARCHAR(50) NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oids_full_oid ON oids(full_oid);
CREATE INDEX IF NOT EXISTS idx_oids_user_id ON oids(user_id);

CREATE SEQUENCE IF NOT EXISTS oid_suffix_seq START WITH 1004;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_oids_updated_at ON oids;
CREATE TRIGGER update_oids_updated_at
BEFORE UPDATE ON oids
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert initial seed data
INSERT INTO oids (oid, full_oid, parent_oid, user_id, name, role, access_level, expires)
VALUES 
    ('1001', '1.3.6.1.4.1.61026.2.1001', '1.3.6.1.4.1.61026.2', 'admin', 'System Administrator Badge', 'admin', 'high', '2030-01-01 00:00:00'),
    ('1002', '1.3.6.1.4.1.61026.2.1002', '1.3.6.1.4.1.61026.2', 'developer', 'Developer Badge', 'developer', 'medium', '2027-01-01 00:00:00'),
    ('1003', '1.3.6.1.4.1.61026.2.1003', '1.3.6.1.4.1.61026.2', 'user', 'Basic User Badge', 'user', 'low', '2026-01-01 00:00:00')
ON CONFLICT (oid) DO NOTHING;

SELECT setval(
    'oid_suffix_seq',
    GREATEST(
        (SELECT last_value FROM oid_suffix_seq),
        COALESCE(
            (SELECT MAX(oid::BIGINT) FROM oids WHERE oid ~ '^[0-9]+$'),
            1003
        ),
        1003
    )
);
