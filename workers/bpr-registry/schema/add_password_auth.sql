
-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Create hashed password for fadil369 (password: fadil369_bpr_demo)
-- We'll compute this in the Worker at runtime using crypto.subtle
-- For now, we mark this user as having password auth enabled
