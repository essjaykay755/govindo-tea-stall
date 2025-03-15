-- Drop existing policies
DROP POLICY IF EXISTS "Only admin can insert tournament teams" ON public.tournament_teams;
DROP POLICY IF EXISTS "Only admin can update tournament teams" ON public.tournament_teams;
DROP POLICY IF EXISTS "Only admin can delete tournament teams" ON public.tournament_teams;

DROP POLICY IF EXISTS "Only admin can insert tournament matches" ON public.tournament_matches;
DROP POLICY IF EXISTS "Only admin can update tournament matches" ON public.tournament_matches;
DROP POLICY IF EXISTS "Only admin can delete tournament matches" ON public.tournament_matches;

DROP POLICY IF EXISTS "Only admin can insert tournament settings" ON public.tournament_settings;
DROP POLICY IF EXISTS "Only admin can update tournament settings" ON public.tournament_settings;
DROP POLICY IF EXISTS "Only admin can delete tournament settings" ON public.tournament_settings;

-- Create more permissive policies for development
-- Any authenticated user can modify tournament data
CREATE POLICY "Authenticated users can insert tournament teams"
ON public.tournament_teams
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tournament teams"
ON public.tournament_teams
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tournament teams"
ON public.tournament_teams
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert tournament matches"
ON public.tournament_matches
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tournament matches"
ON public.tournament_matches
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tournament matches"
ON public.tournament_matches
FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert tournament settings"
ON public.tournament_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tournament settings"
ON public.tournament_settings
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tournament settings"
ON public.tournament_settings
FOR DELETE
TO authenticated
USING (true); 