import React, { useState } from 'react';
import * as api from '../services/supabaseApi';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12 relative">
        <div className="text-center mb-10">
          <div className="inline-block w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Lớp học</h1>
          <p className="text-slate-500 mt-2">GVCN Nguyễn VĂN HÀ</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
            <strong>Hướng dẫn đăng nhập:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1">
                <li><strong>Giáo viên:</strong> Dùng Email & Mật khẩu.</li>
                <li><strong>Học sinh:</strong> 
                  <ul className="list-none pl-4 pt-1 text-blue-600 text-xs">
                    <li>- Cách 1: Email & Mật khẩu (nếu đã được cấp).</li>
                    <li>- Cách 2: Nhập <b>Mã HS</b> (vd: HS001) vào ô Email và Mật khẩu là <b>Ngày sinh</b> (vd: 2014-01-20).</li>
                  </ul>
                </li>
            </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email / Mã HS</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              placeholder="Vd: teacher@gmail.com hoặc HS001"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu / Ngày sinh</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'
            }`}
          >
            {loading ? 'Đang kiểm tra...' : 'ĐĂNG NHẬP HỆ THỐNG'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>Powered by Supabase Database</p>
          <p className="mt-1">© 2024 GVCN Nguyễn Văn Hà</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
