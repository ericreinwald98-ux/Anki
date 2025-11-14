import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  language: string;
  category: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  times_reviewed: number;
  last_reviewed_at: string | null;
  learned: boolean;
  learned_at: string | null;
}
