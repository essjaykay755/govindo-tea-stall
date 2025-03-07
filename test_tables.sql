-- Test if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Test members table
SELECT count(*) FROM members;

-- Test if attendance table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_schema = 'public' AND 
  table_name = 'attendance'
ORDER BY 
  ordinal_position;

-- Test RLS policies
SELECT * FROM pg_policies WHERE tablename = 'attendance';

-- Test if storage buckets exist
SELECT name FROM storage.buckets; 