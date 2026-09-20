
-- Create fadil369 user with password auth
INSERT OR IGNORE INTO users (id, email, email_verified, password_hash, created_at, updated_at) VALUES
  ('845956e38b5aaefa', 'fadil369@gmail.com', 1, '2221876f0fe0adb90ff1533aa4defcd6c63c5946c6e324389e70d69571560463', '2026-09-03T05:45:51.935202Z', '2026-09-03T05:45:51.935202Z');

-- Link this user to provider SA-PHY-000001
UPDATE providers SET owner_user_id='845956e38b5aaefa' WHERE spid='SA-PHY-000001';
