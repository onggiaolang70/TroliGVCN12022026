
import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Bảng điều khiển</h1>
        <p className="text-xl font-bold text-slate-800">Chào mừng trở lại, {user.name}!</p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500">{user.role === 'teacher' ? 'Giáo viên Chủ nhiệm' : user.role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center text-teal-700 font-bold">
          {user.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Header;
