-- ============================================
-- ALLOW JUDGE UPDATES
-- Run this in the Supabase SQL Editor
-- ============================================

-- Add policy to allow judges to update their own evaluations
CREATE POLICY "Judges can update own evaluations"
ON evaluations FOR UPDATE
USING (auth.uid()::text = judge_id::text)
WITH CHECK (auth.uid()::text = judge_id::text);
