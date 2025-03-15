-- Create tournament-related tables

-- Tournament teams table
CREATE TABLE IF NOT EXISTS public.tournament_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    player1_id UUID NOT NULL REFERENCES public.members(id),
    player2_id UUID NOT NULL REFERENCES public.members(id),
    group TEXT,
    stage TEXT DEFAULT 'group',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tournament matches table
CREATE TABLE IF NOT EXISTS public.tournament_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team1_id UUID NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
    team2_id UUID NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    stage TEXT NOT NULL,
    group TEXT,
    winner_id UUID REFERENCES public.tournament_teams(id),
    scores JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tournament settings table
CREATE TABLE IF NOT EXISTS public.tournament_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS tournament_teams_group_idx ON public.tournament_teams(group);
CREATE INDEX IF NOT EXISTS tournament_teams_stage_idx ON public.tournament_teams(stage);
CREATE INDEX IF NOT EXISTS tournament_matches_stage_idx ON public.tournament_matches(stage);
CREATE INDEX IF NOT EXISTS tournament_matches_group_idx ON public.tournament_matches(group);
CREATE INDEX IF NOT EXISTS tournament_matches_date_idx ON public.tournament_matches(date);

-- Set up Row Level Security (RLS)
-- Enable RLS on the tournament tables
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can read tournament data
CREATE POLICY "Anyone can read tournament teams"
ON public.tournament_teams
FOR SELECT USING (true);

CREATE POLICY "Anyone can read tournament matches"
ON public.tournament_matches
FOR SELECT USING (true);

CREATE POLICY "Anyone can read tournament settings"
ON public.tournament_settings
FOR SELECT USING (true);

-- Only admin can modify tournament data
CREATE POLICY "Only admin can insert tournament teams"
ON public.tournament_teams
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
));

CREATE POLICY "Only admin can update tournament teams"
ON public.tournament_teams
FOR UPDATE
TO authenticated
USING (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
));

CREATE POLICY "Only admin can delete tournament teams"
ON public.tournament_teams
FOR DELETE
TO authenticated
USING (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
));

CREATE POLICY "Only admin can insert tournament matches"
ON public.tournament_matches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
));

CREATE POLICY "Only admin can update tournament matches"
ON public.tournament_matches
FOR UPDATE
TO authenticated
USING (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
));

CREATE POLICY "Only admin can delete tournament matches"
ON public.tournament_matches
FOR DELETE
TO authenticated
USING (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
));

CREATE POLICY "Only admin can insert tournament settings"
ON public.tournament_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
));

CREATE POLICY "Only admin can update tournament settings"
ON public.tournament_settings
FOR UPDATE
TO authenticated
USING (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
));

CREATE POLICY "Only admin can delete tournament settings"
ON public.tournament_settings
FOR DELETE
TO authenticated
USING (auth.uid() IN (
    SELECT auth.uid()
    FROM auth.users
    WHERE email = 'essjaykay755@gmail.com'
)); 