import React, { useState, useEffect } from 'react';
import { Notification, User } from '../types';
import * as api from '../services/supabaseApi';

interface NotificationsViewProps {
  currentUser: User;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    Tiêu_đề: '',
    Nội_dung: '',
    Loại: 'info' as 'info' | 'urgent' | 'important' | 'success',
  });

  const isTeacher = currentUser.role === 'teacher' || currentUser.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveNotification({
        ...formData,
        Người_tạo: currentUser.name,
        Trạng_thái: 'Hoạt động'
      });
      setShowModal(false);
      setFormData({ Tiêu_đề: '', Nội_dung: '', Loại: 'info' });
      loadData();
      alert('Đã gửi thông báo thành công!');
    } catch (err) {
      alert('Lỗi: ' + err);
    } finally {
      setSaving(false);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          container: 'bg-red-50 border-red-200',
          iconBg: 'bg-red-100 text-red-600',
          title: 'text-red-800',
          badge: 'Khẩn cấp',
          icon: '🚨'
        };
      case 'important':
        return {
          container: 'bg-amber-50 border-amber-200',
          iconBg: 'bg-amber-100 text-amber-600',
          title: 'text-amber-800',
          badge: 'Quan trọng',
          icon: '⭐'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          iconBg: 'bg-green-100 text-green-600',
          title: 'text-green-800',
          badge: 'Tin vui',
          icon: '🎉'
        };
      default: // info
        return {
          container: 'bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-100 text-blue-600',
          title: 'text-blue-800',
          badge: 'Bình thường',
          icon: 'ℹ️'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bảng tin Thông báo</h2>
          <p className="text-sm text-slate-500">Cập nhật tin tức mới nhất của lớp học</p>
        </div>
        {isTeacher && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-teal-200 transition-all flex items-center gap-2"
          >
            <span>✏️</span> Tạo thông báo
          </button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => {
            const styles = getTypeStyles(notif.Loại);
            return (
              <div key={notif.ID} className={`p-6 rounded-2xl border ${styles.container} transition-all hover:shadow-md animate-slideIn`}>
                <div className="flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${styles.iconBg}`}>
                    {styles.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/50 border border-white/20 tracking-wider ${styles.title}`}>
                        {styles.badge}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{notif.Ngày_tạo} • {notif.Thời_gian}</span>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${styles.title}`}>{notif.Tiêu_đề}</h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{notif.Nội_dung}</p>
                    <div className="mt-3 pt-3 border-t border-black/5 flex justify-between items-center">
                       <span className="text-xs text-slate-500">Người đăng: <b>{notif.Người_tạo}</b></span>
                       {notif.Trạng_thái !== 'Hoạt động' && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Đã lưu trữ</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
            Chưa có thông báo nào được đăng.
          </div>
        )}
      </div>

      {/* Modal Add Notification */}
      {showModal && isTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-zoomIn">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              📢 Đăng Thông Báo Mới
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Tiêu đề thông báo</label>
                <input 
                  type="text" 
                  placeholder="Vd: Lịch thi cuối kỳ, Nhắc nhở nộp bài..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  value={formData.Tiêu_đề}
                  onChange={(e) => setFormData({...formData, Tiêu_đề: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Mức độ ưu tiên</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, Loại: 'info'})}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${formData.Loại === 'info' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    ℹ️ Bình thường
                  </button>
                   <button
                    type="button"
                    onClick={() => setFormData({...formData, Loại: 'success'})}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${formData.Loại === 'success' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    🎉 Tin vui
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, Loại: 'important'})}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${formData.Loại === 'important' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    ⭐ Quan trọng
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, Loại: 'urgent'})}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${formData.Loại === 'urgent' ? 'bg-red-100 border-red-300 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    🚨 Khẩn cấp
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Nội dung chi tiết</label>
                <textarea 
                  rows={5}
                  placeholder="Nhập nội dung đầy đủ của thông báo..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  value={formData.Nội_dung}
                  onChange={(e) => setFormData({...formData, Nội_dung: e.target.value})}
                  required
                ></textarea>
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
                  {saving ? 'Đang gửi...' : 'Đăng ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
