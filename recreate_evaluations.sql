-- ============================================
-- REPAIR: Recreate Evaluations Table
-- Run this script in the Supabase SQL Editor
-- ============================================

-- 1. Create Evaluations Table (It was deleted when Teams was dropped)
DROP TABLE IF EXISTS evaluations CASCADE;
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

-- 2. Restore Indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_judge ON evaluations(judge_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_team ON evaluations(team_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_created ON evaluations(created_at);

-- 3. Enable RLS
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 4. Restore Policies

-- Judges can view only their own evaluations
CREATE POLICY "Judges can view own evaluations"
ON evaluations FOR SELECT
USING (auth.uid()::text = judge_id::text);

-- Judges can insert evaluations (one per team enforced by unique constraint)
CREATE POLICY "Judges can insert evaluations"
ON evaluations FOR INSERT
WITH CHECK (auth.uid()::text = judge_id::text);

-- Admins can view all evaluations
CREATE POLICY "Admins can view all evaluations"
ON evaluations FOR SELECT
TO authenticated
USING (
    (auth.jwt() ->> 'email') NOT LIKE '%@judge.adzapp.com'
);

-- 5. Restore Trigger for Validation
CREATE OR REPLACE FUNCTION validate_total_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_score != (NEW.skit_execution + NEW.slogan_jingle + NEW.team_coordination) THEN
        RAISE EXCEPTION 'Total score must equal sum of components';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_total_score ON evaluations;
CREATE TRIGGER check_total_score
BEFORE INSERT ON evaluations
FOR EACH ROW
EXECUTE FUNCTION validate_total_score();
