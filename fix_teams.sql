-- ============================================
-- FIX: Update Teams List
-- Run this script in the Supabase SQL Editor
-- ============================================

-- 1. Clears existing teams (to remove "undefined" entries)
-- Note: This cascades to delete evaluations linked to these teams
TRUNCATE TABLE teams CASCADE;

-- 2. Insert the correct list of Team Leaders
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

-- Validation Query
SELECT * FROM teams ORDER BY team_number;
