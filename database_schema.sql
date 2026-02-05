-- ============================================
-- AdZapp Judge Evaluation System
-- Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Judges Table
-- Stores judge authentication and profile information
CREATE TABLE judges (
    judge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judge_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Table
-- Pre-created teams by admin
CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_number INT UNIQUE NOT NULL,
    team_leader TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations Table
-- Stores all judge evaluations with unique constraint per judge-team pair
CREATE TABLE evaluations (
    evaluation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judge_id UUID NOT NULL REFERENCES judges(judge_id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    
    -- Score fields
    skit_execution INT NOT NULL CHECK (skit_execution >= 0 AND skit_execution <= 20),
    slogan_jingle INT NOT NULL CHECK (slogan_jingle >= 0 AND slogan_jingle <= 15),
    team_coordination INT NOT NULL CHECK (team_coordination >= 0 AND team_coordination <= 15),
    total_score INT NOT NULL CHECK (total_score >= 0 AND total_score <= 50),
    
    -- Rule compliance fields
    offensive_content BOOLEAN NOT NULL DEFAULT FALSE,
    original_content BOOLEAN NOT NULL DEFAULT TRUE,
    time_limit_followed BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- CRITICAL: Prevent duplicate submissions
    CONSTRAINT unique_judge_team UNIQUE (judge_id, team_id)
);

-- Create indexes for performance
CREATE INDEX idx_evaluations_judge ON evaluations(judge_id);
CREATE INDEX idx_evaluations_team ON evaluations(team_id);
CREATE INDEX idx_evaluations_created ON evaluations(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- JUDGES TABLE POLICIES
-- ============================================

-- Judges can read their own profile, Admins can read all profiles
CREATE POLICY "Profiles are viewable by owner and admins"
ON judges FOR SELECT
USING (
    auth.uid()::text = judge_id::text 
    OR (auth.jwt() ->> 'email') NOT LIKE '%@judge.adzapp.com'
);

-- Allow judges to be created (for registration)
CREATE POLICY "Allow judge creation"
ON judges FOR INSERT
WITH CHECK (true);

-- ============================================
-- TEAMS TABLE POLICIES
-- ============================================

-- All authenticated users can view teams
CREATE POLICY "Authenticated users can view teams"
ON teams FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert teams
CREATE POLICY "Admins can insert teams"
ON teams FOR INSERT
TO authenticated
WITH CHECK (
    (auth.jwt() ->> 'email') NOT LIKE '%@judge.adzapp.com'
);

-- ============================================
-- EVALUATIONS TABLE POLICIES
-- ============================================

-- Judges can view only their own evaluations
CREATE POLICY "Judges can view own evaluations"
ON evaluations FOR SELECT
USING (auth.uid()::text = judge_id::text);

-- Judges can insert evaluations (one per team enforced by unique constraint)
CREATE POLICY "Judges can insert evaluations"
ON evaluations FOR INSERT
WITH CHECK (auth.uid()::text = judge_id::text);

-- Judges CANNOT update evaluations (submissions are final)
-- No UPDATE policy = no updates allowed

-- Judges CANNOT delete evaluations (submissions are permanent)
-- No DELETE policy = no deletes allowed

-- Admins can view all evaluations
CREATE POLICY "Admins can view all evaluations"
ON evaluations FOR SELECT
TO authenticated
USING (
    (auth.jwt() ->> 'email') NOT LIKE '%@judge.adzapp.com'
);

-- ============================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Insert sample teams (15 teams as mentioned in requirements)
INSERT INTO teams (team_number, team_leader) VALUES
(1, 'John Doe'),
(2, 'Jane Smith'),
(3, 'Michael Johnson'),
(4, 'Emily Brown'),
(5, 'Chris Wilson'),
(6, 'Sarah Taylor'),
(7, 'David Miller'),
(8, 'Jessica Davis'),
(9, 'Matthew Garcia'),
(10, 'Ashley Rodriguez'),
(11, 'Joshua Martinez'),
(12, 'Amanda Hernandez'),
(13, 'Daniel Lopez'),
(14, 'Elizabeth Gonzalez'),
(15, 'Joseph Perez');

-- ============================================
-- HELPER VIEWS (OPTIONAL - FOR ADMIN DASHBOARD)
-- ============================================

-- View to get team rankings with all calculations
CREATE OR REPLACE VIEW team_rankings AS
SELECT 
    t.team_id,
    t.team_number,
    t.team_leader,
    COUNT(e.evaluation_id) AS judges_count,
    COALESCE(SUM(e.total_score), 0) AS final_score,
    BOOL_OR(e.offensive_content) AS has_offensive_content,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'judge_name', j.judge_name,
            'total_score', e.total_score,
            'skit_execution', e.skit_execution,
            'slogan_jingle', e.slogan_jingle,
            'team_coordination', e.team_coordination,
            'offensive_content', e.offensive_content,
            'original_content', e.original_content,
            'time_limit_followed', e.time_limit_followed,
            'created_at', e.created_at
        ) ORDER BY e.created_at
    ) FILTER (WHERE e.evaluation_id IS NOT NULL) AS judge_details
FROM teams t
LEFT JOIN evaluations e ON t.team_id = e.team_id
LEFT JOIN judges j ON e.judge_id = j.judge_id
GROUP BY t.team_id, t.team_number, t.team_leader
ORDER BY final_score DESC, t.team_number ASC;

-- Grant access to the view
GRANT SELECT ON team_rankings TO authenticated;

-- ============================================
-- FUNCTIONS (OPTIONAL - FOR VALIDATION)
-- ============================================

-- Function to validate total score matches sum of components
CREATE OR REPLACE FUNCTION validate_total_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_score != (NEW.skit_execution + NEW.slogan_jingle + NEW.team_coordination) THEN
        RAISE EXCEPTION 'Total score must equal sum of components';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate total score on insert
CREATE TRIGGER check_total_score
BEFORE INSERT ON evaluations
FOR EACH ROW
EXECUTE FUNCTION validate_total_score();

-- ============================================
-- NOTES
-- ============================================

/*
IMPORTANT SETUP STEPS:

1. Create a Supabase project at https://supabase.com

2. Run this entire SQL script in the Supabase SQL Editor

3. Create admin users manually:
   - Go to Authentication > Users in Supabase dashboard
   - Create users with email ending in @admin.adzapp.com
   - These users will have admin privileges

4. Create judge users:
   - Judges can be created via the application
   - Or manually in Supabase dashboard
   - Link judge_id to auth.uid() when creating

5. Get your Supabase credentials:
   - Project URL: https://[your-project].supabase.co
   - Anon Key: Found in Settings > API

6. Update config.js with your credentials

SECURITY NOTES:
- RLS is enabled on all tables
- Judges can only see their own evaluations
- Judges cannot edit or delete after submission
- Unique constraint prevents duplicate submissions
- Admin access requires email NOT ending in @judge.adzapp.com (e.g., @gmail.com or @admin.adzapp.com)
*/
