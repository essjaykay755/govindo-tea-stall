-- Create tables
-- Attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    section TEXT NOT NULL CHECK (section IN ('Adda', 'Carrom')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS attendance_date_idx ON public.attendance(date);
CREATE INDEX IF NOT EXISTS attendance_user_id_idx ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS attendance_section_idx ON public.attendance(section);

-- Set up Row Level Security (RLS)
-- Enable RLS on the attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read attendance
CREATE POLICY "Anyone can read attendance" 
ON public.attendance 
FOR SELECT USING (true);

-- Authenticated users can insert their own attendance
CREATE POLICY "Authenticated users can insert attendance" 
ON public.attendance 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Users can delete their own attendance
CREATE POLICY "Users can delete their own attendance" 
ON public.attendance 
FOR DELETE 
TO authenticated 
USING (true);

-- Only admin can update attendance
CREATE POLICY "Only admin can update attendance" 
ON public.attendance 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IN (
    SELECT auth.uid() 
    FROM auth.users 
    WHERE email = 'essjaykay755@gmail.com'
)); 