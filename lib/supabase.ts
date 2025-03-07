import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type User = {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
};

export type Member = {
  id: string;
  name: string;
  image: string;
};

export type Attendance = {
  id: string;
  date: string;
  section: 'Adda' | 'Carrom';
  user_id: string;
  created_at: string;
};

export type PartnerAssignment = {
  id: string;
  date: string;
  player1_id: string;
  player2_id: string;
  created_at: string;
};

export type PhotoHistory = {
  id: string;
  date: string;
  image_url: string;
  created_at: string;
}; 