import React, { useState, useEffect } from 'react';
import { User, Student, DashboardData } from './types';
import * as api from './services/supabaseApi';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './views/DashboardView';
import StudentsView from './views/StudentsView';
import ScoringView from './views/ScoringView';
import PlansView from './views/PlansView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';
import NotificationsView from './views/NotificationsView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('gv_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [dash, stds] = await Promise.all([
        api.getDashboardData(),
        api.getStudents()
      ]);
      setDashboardData(dash);
      setStudents(stds);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('gv_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gv_user');
  };

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  const isStudent = user.role === 'student';

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
          {loading && (
            <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
                <p className="text-teal-800 font-bold animate-pulse">Đang kết nối Supabase Database...</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && dashboardData && (
            <DashboardView data={dashboardData} />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationsView currentUser={user} />
          )}

          {activeTab === 'students' && (
            <StudentsView students={students} currentUser={user} />
          )}

          {/* Teacher Only Views */}
          {!isStudent && activeTab === 'scoring' && (
            <ScoringView students={students} onSave={fetchInitialData} />
          )}

          {activeTab === 'plans' && (
            <PlansView currentUser={user} />
          )}

          {!isStudent && activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
