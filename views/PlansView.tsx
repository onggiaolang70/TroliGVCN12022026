import React, { useState, useEffect } from 'react';
import { WeeklyPlan, User } from '../types';
import * as api from '../services/supabaseApi';

interface PlansViewProps {
  currentUser: User;
}

const PlansView: React.FC<PlansViewProps> = ({ currentUser }) => {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Quản lý tuần
  const [currentWeek, setCurrentWeek] = useState(1);
  const weeks = Array.from({ length: 35 }, (_, i) => i + 1);
  
  // Quản lý ngày của tuần
  const [weekDates, setWeekDates] = useState<{[key: number]: string}>({});

  const [formData, setFormData] = useState({
    Tuần: 1,
    Thứ: 'Thứ 2',
    Nội_dung: '',
    Thời_gian: '',
    Địa_điểm: '',
    Người_phụ_trách: 'GVCN',
    Trạng_thái: 'Hoạt động'
  });

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'admin';

  useEffect(() => {
    loadPlans();
    const savedDates = localStorage.getItem('week_dates_map');
    if (savedDates) {
      setWeekDates(JSON.parse(savedDates));
    }
  }, []);

  const loadPlans = async () => {
    try {
      const data = await api.getWeeklyPlans();
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData(prev => ({ ...prev, Tuần: currentWeek }));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveWeeklyPlan(formData);
      setShowModal(false);
      setFormData({
        Tuần: currentWeek,
        Thứ: 'Thứ 2',
        Nội_dung: '',
        Thời_gian: '',
        Địa_điểm: '',
        Người_phụ_trách: 'GVCN',
        Trạng_thái: 'Hoạt động'
      });
      loadPlans(); 
      alert('Đã thêm kế hoạch thành công!');
    } catch (err) {
      alert('Lỗi: ' + err);
    } finally {
      setSaving(false);
    }
  };

  const handleStartDateChange = (date: string) => {
    const newMap = { ...weekDates, [currentWeek]: date };
    setWeekDates(newMap);
    localStorage.setItem('week_dates_map', JSON.stringify(newMap));
  };

  const calculateEndDate = (startDateStr: string) => {
    if (!startDateStr) return '';
    const date = new Date(startDateStr);
    const d = new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString('vi-VN');
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const filteredPlans = plans.filter(p => p.Tuần == currentWeek);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành': return 'bg-green-100 text-green-700';
      case 'Đã hủy': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const currentStartDate = weekDates[currentWeek] || '';
  const currentEndDate = calculateEndDate(currentStartDate);

  return (
    <div className="space-y-6 animate-fadeIn relative">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kế hoạch Tuần</h2>
          <p className="text-sm text-slate-500">Xem và quản lý lịch hoạt động của lớp</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
          {/* Week Selector */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >◀</button>
            
            <select 
              value={currentWeek}
              onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
              className="bg-transparent font-bold text-teal-700 text-center outline-none cursor-pointer appearance-none py-1 px-2"
            >
              {weeks.map(w => (
                <option key={w} value={w}>Tuần {w}</option>
              ))}
            </select>
            
            <button 
              onClick={() => setCurrentWeek(prev => Math.min(35, prev + 1))}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >▶</button>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex-1 md:flex-none">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Từ ngày (Thứ 2)</span>
              {isTeacher ? (
                <input 
                  type="date" 
                  className="text-sm font-bold text-slate-700 outline-none bg-transparent p-0"
                  value={currentStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              ) : (
                <span className="text-sm font-bold text-slate-700">{formatDisplayDate(currentStartDate) || '---'}</span>
              )}
            </div>
            <div className="text-slate-300 text-xl">→</div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Đến ngày (Thứ 7)</span>
              <span className="text-sm font-bold text-teal-700">{currentEndDate || '---'}</span>
            </div>
          </div>

          {isTeacher && (
            <button 
              onClick={handleOpenAddModal}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-teal-200 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>+</span> Thêm mới
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredPlans.length > 0 ? (
          filteredPlans.map(plan => (
            <div key={plan.ID} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group animate-zoomIn">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider">
                  {plan.Thứ}
                </span>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusColor(plan.Trạng_thái)}`}>
                  {plan.Trạng_thái}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">{plan.Nội_dung}</h3>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2"><span>🕑</span> {plan.Thời_gian}</div>
                <div className="flex items-center gap-2"><span>📍</span> {plan.Địa_điểm}</div>
                <div className="flex items-center gap-2"><span>👤</span> {plan.Người_phụ_trách}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
            Không có kế hoạch nào trong <strong>Tuần {currentWeek}</strong> 
            {currentStartDate && ` (${formatDisplayDate(currentStartDate)} - ${currentEndDate})`}.
          </div>
        )}
      </div>

      {/* Add Plan Modal */}
      {showModal && isTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-zoomIn">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Thêm Kế hoạch - Tuần {formData.Tuần}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Tuần học</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.Tuần}
                    onChange={(e) => setFormData({...formData, Tuần: parseInt(e.target.value)})}
                  >
                    {weeks.map(w => <option key={w} value={w}>Tuần {w}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Thứ</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.Thứ}
                    onChange={(e) => setFormData({...formData, Thứ: e.target.value})}
                  >
                    <option>Thứ 2</option>
                    <option>Thứ 3</option>
                    <option>Thứ 4</option>
                    <option>Thứ 5</option>
                    <option>Thứ 6</option>
                    <option>Thứ 7</option>
                    <option>Chủ Nhật</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Thời gian</label>
                    <input 
                        type="text" 
                        placeholder="07:30"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={formData.Thời_gian}
                        onChange={(e) => setFormData({...formData, Thời_gian: e.target.value})}
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Trạng thái</label>
                    <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={formData.Trạng_thái}
                        onChange={(e) => setFormData({...formData, Trạng_thái: e.target.value})}
                    >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Nội dung hoạt động</label>
                <input 
                  type="text" 
                  placeholder="Vd: Chào cờ đầu tuần"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.Nội_dung}
                  onChange={(e) => setFormData({...formData, Nội_dung: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Địa điểm</label>
                <input 
                  type="text" 
                  placeholder="Vd: Sân trường"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.Địa_điểm}
                  onChange={(e) => setFormData({...formData, Địa_điểm: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all"
                >
                  {saving ? 'Đang lưu...' : 'Lưu kế hoạch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansView;
