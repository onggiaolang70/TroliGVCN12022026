/**
 * SUPABASE CONFIGURATION
 * Cấu hình kết nối Supabase - Hardcoded credentials
 */

export const supabaseConfig = {
  url: 'https://jaeafujranojcpixqftg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZWFmdWpyYW5vamNwaXhxZnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxODQ4NjUsImV4cCI6MjA4Mzc2MDg2NX0.YNqOBM3r5GIKF3VuYS7cfVrGqIzrt6PZrj-TtaeWwCU'
};

/**
 * ⚠️ LƯU Ý BẢO MẬT:
 * - API key này là "anon" key (public key) - an toàn để public
 * - KHÔNG bao giờ share "service_role" key (secret key)
 * - Sử dụng Row Level Security (RLS) để bảo vệ dữ liệu
 */
