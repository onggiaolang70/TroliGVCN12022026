import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config/supabaseConfig';

// Tạo Supabase client với config đã hardcode
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Helper function để kiểm tra config
export const isSupabaseConfigured = () => {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
};
