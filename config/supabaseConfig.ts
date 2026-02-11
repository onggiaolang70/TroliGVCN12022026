/**
 * SUPABASE CONFIGURATION
 * Cấu hình kết nối Supabase - Hardcoded credentials
 */

export const supabaseConfig = {
  url: 'https://https://nnhtkdqvuozqhjtutxls.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaHRrZHF2dW96cWhqdHV0eGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTUyNTYsImV4cCI6MjA4NjM5MTI1Nn0.OMG6ph94T_woTm0hEF9iaH8_o-Ndiz3Z2zc31Wppv6w'
};

/**
 * ⚠️ LƯU Ý BẢO MẬT:
 * - API key này là "anon" key (public key) - an toàn để public
 * - KHÔNG bao giờ share "service_role" key (secret key)
 * - Sử dụng Row Level Security (RLS) để bảo vệ dữ liệu
 */
