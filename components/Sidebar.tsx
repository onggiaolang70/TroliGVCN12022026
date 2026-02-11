
import React, { useEffect, useState } from 'react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gv_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const isStudent = user?.role === 'student';

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊', show: true },
    { id: 'notifications', label: 'Thông báo', icon: '🔔', show: true },
    { id: 'students', label: isStudent ? 'Thông tin lớp' : 'Học sinh', icon: '🧑‍🎓', show: true },
    { id: 'scoring', label: 'Ghi nhận điểm', icon: '📝', show: !isStudent },
    { id: 'plans', label: 'Kế hoạch tuần', icon: '📅', show: true },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️', show: !isStudent },
  ];

  return (
    <aside className="w-20 md:w-64 bg-teal-800 text-white flex flex-col transition-all duration-300">
      <div className="p-4 flex items-center justify-center md:justify-start gap-3 border-b border-teal-700">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-teal-800 text-xl font-bold shadow-lg">
          {isStudent ? 'HS' : 'PH'}
        </div>
        <span className="hidden md:block font-bold text-lg tracking-tight">
          {isStudent ? 'HỌC SINH' : 'GVCN PHÚC'}
        </span>
      </div>

      <nav className="flex-1 mt-6 px-2 space-y-2">
        {menuItems.filter(i => i.show).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' 
                : 'text-teal-100 hover:bg-teal-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-teal-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl text-teal-100 hover:bg-red-600 hover:text-white transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="hidden md:block font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
