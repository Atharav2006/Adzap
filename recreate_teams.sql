-- ============================================
-- REPAIR: Recreate Teams Table & Insert Data
-- Run this script in the Supabase SQL Editor
-- ============================================

-- 1. Drop the existing table (and anything linked to it)
-- WARNING: This deletes all existing team data and linked evaluations!
DROP TABLE IF EXISTS teams CASCADE;

-- 2. Create the table with the CORRECT columns
CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_number INT UNIQUE NOT NULL,
    team_leader TEXT NOT NULL, -- This is the missing column
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Restore Security Policies (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view teams" 
ON teams FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can insert teams" 
ON teams FOR INSERT 
TO authenticated 
WITH CHECK (
    (auth.jwt() ->> 'email') NOT LIKE '%@judge.adzapp.com'
);

-- 4. Insert the Team Leaders
INSERT INTO teams (team_number, team_leader) VALUES
(1, 'Shrey Miteshbhai Butala'),
(2, 'Parth M'),
(3, 'Kothari Krupali Ashokbhai'),
(4, 'Vagadiya yati nareshbhai'),
(5, 'Aleena Sebi'),
(6, 'Patel Khushi Nirajkumar'),
(7, 'Patel Dhruvi Sanjaykumar'),
(8, 'Pal Umesh Laltabhai'),
(9, 'Dhrumi Tailor'),
(10, 'Dishant Solanki'),
(11, 'Daksh Mehta'),
(12, 'Patel DhruvikaKumari shaileshbhai');

-- 5. Validation
SELECT * FROM teams ORDER BY team_number;
