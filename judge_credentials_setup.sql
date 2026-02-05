-- ============================================
-- AdZapp Judge Evaluation System
-- Pre-configured Judge Credentials Setup
-- ============================================

-- This script creates judge accounts with predefined credentials
-- Run this AFTER running the main database_schema.sql

-- First, we need to create auth users for each judge
-- Note: You'll need to create these users in Supabase Auth Dashboard first
-- Then run this script to link them to the judges table

-- ============================================
-- JUDGE CREDENTIALS MAPPING
-- ============================================

/*
Judge Name: Chetna Chand
Username: chetna.chand
Email: chetna.chand@judge.adzapp.com
Password: chetna123

Judge Name: Purvi Ramanujan
Username: purvi.ramanujan
Email: purvi.ramanujan@judge.adzapp.com
Password: purvi123

Judge Name: Vashim Qureshi
Username: vashim.qureshi
Email: vashim.qureshi@judge.adzapp.com
Password: vashim123

Judge Name: Hetal Joshiyara
Username: hetal.joshiyara
Email: hetal.joshiyara@judge.adzapp.com
Password: hetal123
*/

-- ============================================
-- ALTERNATIVE: Store judge credentials in database
-- ============================================

-- Create a table to store judge login credentials (username-based)
CREATE TABLE IF NOT EXISTS judge_credentials (
    credential_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judge_name TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on judge_credentials
ALTER TABLE judge_credentials ENABLE ROW LEVEL SECURITY;

-- Allow public read for authentication (we'll verify password in application)
CREATE POLICY "Anyone can read judge credentials for auth"
ON judge_credentials FOR SELECT
TO anon, authenticated
USING (true);

-- Insert predefined judge credentials
-- Note: In production, these passwords should be properly hashed
-- For now, we'll store them as plain text for simplicity (NOT RECOMMENDED FOR PRODUCTION)
INSERT INTO judge_credentials (judge_name, username, password_hash) VALUES
('Chetna Chand', 'chetna.chand', 'chetna123'),
('Purvi Ramanujan', 'purvi.ramanujan', 'purvi123'),
('Vashim Qureshi', 'vashim.qureshi', 'vashim123'),
('Hetal Joshiyara', 'hetal.joshiyara', 'hetal123')
ON CONFLICT (judge_name) DO NOTHING;

-- ============================================
-- INSTRUCTIONS FOR SUPABASE AUTH SETUP
-- ============================================

/*
OPTION 1: Create users in Supabase Auth Dashboard
1. Go to Authentication > Users
2. Create each judge with their email:
   - chetna.chand@judge.adzapp.com (password: chetna123)
   - purvi.ramanujan@judge.adzapp.com (password: purvi123)
   - vashim.qureshi@judge.adzapp.com (password: vashim123)
   - hetal.joshiyara@judge.adzapp.com (password: hetal123)

3. After creating, get their user IDs and run:
   INSERT INTO judges (judge_id, judge_name, email) VALUES
   ('user-id-1', 'Chetna Chand', 'chetna.chand@judge.adzapp.com'),
   ('user-id-2', 'Purvi Ramanujan', 'purvi.ramanujan@judge.adzapp.com'),
   ('user-id-3', 'Vashim Qureshi', 'vashim.qureshi@judge.adzapp.com'),
   ('user-id-4', 'Hetal Joshiyara', 'hetal.joshiyara@judge.adzapp.com');

OPTION 2: The Signup Page has been removed. 
All judges must be pre-created by the administrator in the Supabase Auth system to login.
*/

-- ============================================
-- HELPER FUNCTION: Generate email from judge name
-- ============================================

CREATE OR REPLACE FUNCTION generate_judge_email(judge_name_input TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Convert "Chetna Chand" to "chetna.chand@judge.adzapp.com"
    RETURN LOWER(REPLACE(TRIM(judge_name_input), ' ', '.')) || '@judge.adzapp.com';
END;
$$ LANGUAGE plpgsql;

-- Test the function
-- SELECT generate_judge_email('Chetna Chand'); -- Returns: chetna.chand@judge.adzapp.com
