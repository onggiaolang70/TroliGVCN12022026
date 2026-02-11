import React from 'react';
import { DashboardData } from '../types';

interface DashboardViewProps {
  data: DashboardData;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-teal-500">
          <p className="text-slate-500 text-sm font-medium">Sĩ số lớp</p>
          <p className="text-3xl font-bold text-slate-800">{data.stats.totalStudents}</p>
          <p className="text-xs text-teal-600 mt-1">Học sinh đã đăng ký</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <p className="text-slate-500 text-sm font-medium">Đang học</p>
          <p className="text-3xl font-bold text-slate-800">{data.stats.activeStudents}</p>
          <p className="text-xs text-blue-600 mt-1">Đang tham gia lớp</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-amber-500">
          <p className="text-slate-500 text-sm font-medium">HS Xuất sắc (5PC)</p>
          <p className="text-3xl font-bold text-slate-800">{data.stats.highPerformers}</p>
          <p className="text-xs text-amber-600 mt-1">Đạt TB trên 4.5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Thông báo mới nhất</h3>
            <button className="text-teal-600 text-sm font-medium hover:underline">Xem tất cả</button>
          </div>
          <div className="space-y-4">
            {data.recentNotifications.map((notif) => (
              <div key={notif.ID} className="flex gap-4 p-4 rounded-xl bg-slate-50 hover:bg-teal-50 transition-colors">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.Loại === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {notif.Loại === 'urgent' ? '⚠️' : 'ℹ️'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{notif.Tiêu_đề}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2">{notif.Nội_dung}</p>
                  <p className="text-xs text-slate-400 mt-2">{notif.Ngày_tạo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Plans */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Kế hoạch sắp tới</h3>
            <button className="text-teal-600 text-sm font-medium hover:underline">Xem lịch</button>
          </div>
          <div className="space-y-4">
            {data.upcomingPlans.map((plan) => (
              <div key={plan.ID} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl">
                <div className="bg-teal-100 text-teal-700 font-bold px-3 py-1 rounded-md text-sm whitespace-nowrap">
                  {plan.Thứ}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{plan.Nội_dung}</h4>
                  <div className="flex gap-4 text-xs text-slate-500 mt-1">
                    <span>🕐 {plan.Thời_gian}</span>
                    <span>📍 {plan.Địa_điểm}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
