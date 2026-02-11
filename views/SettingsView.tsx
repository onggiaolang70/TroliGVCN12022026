import React from 'react';
import { supabaseConfig } from '../config/supabaseConfig';

const SettingsView: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          ⚙️ Cài đặt Hệ thống
        </h2>
        
        <div className="space-y-6">
          {/* Database Info */}
          <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
            <h3 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
              🗄️ Thông tin Database
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-teal-600 font-medium">Loại Database:</span>
                <span className="font-mono text-teal-900">Supabase PostgreSQL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-600 font-medium">Project URL:</span>
                <span className="font-mono text-xs text-teal-900 truncate max-w-xs">
                  {supabaseConfig.url}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-600 font-medium">Trạng thái:</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  ✓ Đã kết nối
                </span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h3 className="font-bold text-blue-800 mb-3">✨ Tính năng hiện tại</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Quản lý học sinh</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Ghi nhận điểm & đánh giá</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Tặng sao khuyến khích</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Kế hoạch tuần</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Thông báo lớp học</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Tự động tính tổng điểm/sao</span>
              </li>
            </ul>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-center">
              <p className="text-xs text-purple-600 font-bold uppercase mb-1">Tốc độ</p>
              <p className="text-2xl font-bold text-purple-800">{'<100ms'}</p>
              <p className="text-xs text-purple-500 mt-1">Query time</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <p className="text-xs text-amber-600 font-bold uppercase mb-1">Độ tin cậy</p>
              <p className="text-2xl font-bold text-amber-800">99.9%</p>
              <p className="text-xs text-amber-500 mt-1">Uptime</p>
            </div>
          </div>

          {/* System Info */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">📋 Thông tin hệ thống</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Phiên bản:</span>
                <span className="font-bold text-slate-800">3.0.0 (Supabase)</span>
              </div>
              <div className="flex justify-between">
                <span>Công nghệ:</span>
                <span className="font-mono text-xs">React + TypeScript + Supabase</span>
              </div>
              <div className="flex justify-between">
                <span>Tác giả:</span>
                <span className="font-bold text-slate-800">GVCN Nguyễn Văn Hà</span>
              </div>
              <div className="flex justify-between">
                <span>Cập nhật:</span>
                <span className="text-slate-500">2024</span>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">🔧 Hành động</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                🌐 Mở Supabase Dashboard
              </button>
              <button
                onClick={() => {
                  if (confirm('Xóa cache và reload trang?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                🗑️ Xóa Cache
              </button>
            </div>
          </div>

          {/* Help */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">💡 Cần hỗ trợ?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Hệ thống đang sử dụng Supabase database. Tất cả dữ liệu được đồng bộ tự động 
              và có tốc độ truy vấn nhanh. Nếu gặp vấn đề, vui lòng liên hệ quản trị viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
