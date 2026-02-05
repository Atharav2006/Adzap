-- ============================================
-- FIX RLS POLICIES
-- Run this in the Supabase SQL Editor
-- This fixes the "violates row-level security policy" error
-- ============================================

-- 1. Reset Policies on Evaluations
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Judges can view own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Judges can insert evaluations" ON evaluations;
DROP POLICY IF EXISTS "Judges can update own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Admins can view all evaluations" ON evaluations;

-- 2. Create Consolidated Policies

-- SELECT: Judges see their own, Admins see all
CREATE POLICY "Judges can view own evaluations"
ON evaluations FOR SELECT
USING (
    (auth.uid()::text = judge_id::text) OR 
    ((auth.jwt() ->> 'email') NOT LIKE '%@judge.adzapp.com')
);

-- INSERT: Judges can insert their own
CREATE POLICY "Judges can insert evaluations"
ON evaluations FOR INSERT
WITH CHECK (auth.uid()::text = judge_id::text);

-- UPDATE: Judges can update their own
CREATE POLICY "Judges can update own evaluations"
ON evaluations FOR UPDATE
USING (auth.uid()::text = judge_id::text)
WITH CHECK (auth.uid()::text = judge_id::text);

-- 3. Ensure Judges Table is readable
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);

ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Judges can read own profile" ON judges FOR SELECT USING (auth.uid()::text = judge_id::text);
CREATE POLICY "Admins can read all judges" ON judges FOR SELECT USING ((auth.jwt() ->> 'email') NOT LIKE '%@judge.adzapp.com');
