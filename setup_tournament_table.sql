-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop the table if it exists (be careful with this in production)
DROP TABLE IF EXISTS tournament_settings;

-- Create tournament_settings table with UUID primary key
CREATE TABLE tournament_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed'))
);

-- Insert default settings
INSERT INTO tournament_settings (start_date, end_date, status)
VALUES (
  NOW(),
  NOW() + INTERVAL '30 days',
  'upcoming'
);

-- Grant RLS permissions as needed
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading of tournament settings for all authenticated users
CREATE POLICY "Tournament settings are viewable by all authenticated users"
ON tournament_settings
FOR SELECT
USING (auth.role() = 'authenticated');

-- Option 1: For now, let all authenticated users update tournament settings
-- You can modify this later to be more restrictive
CREATE POLICY "Tournament settings are editable by authenticated users"
ON tournament_settings
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Option 1: For now, let all authenticated users insert tournament settings
-- You can modify this later to be more restrictive
CREATE POLICY "Tournament settings are insertable by authenticated users"
ON tournament_settings
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Add comment explaining how to set up admin users later
COMMENT ON TABLE admin_users IS 'Table to store admin user IDs. To make a user an admin, insert their Supabase auth.uid into this table.';

-- Optional: If you know an admin user ID, you can add it here
-- INSERT INTO admin_users (user_id) VALUES ('your-admin-user-uuid-here');

-- Option 2: If you want to use the admin_users approach later, uncomment these policies
-- and comment out the "authenticated users" policies above

/*
CREATE POLICY "Tournament settings are editable by admins"
ON tournament_settings
FOR UPDATE
USING (auth.role() = 'authenticated' AND auth.uid() IN (
  SELECT user_id FROM admin_users
));

CREATE POLICY "Tournament settings are insertable by admins"
ON tournament_settings
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() IN (
  SELECT user_id FROM admin_users
));
*/ 