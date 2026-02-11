import React, { useState } from 'react';
import { Student } from '../types';
import * as api from '../services/supabaseApi';

interface ScoringViewProps {
  students: Student[];
  onSave: () => void;
}

const ScoringView: React.FC<ScoringViewProps> = ({ students, onSave }) => {
  const [activeTab, setActiveTab] = useState<'score' | 'assessment' | 'star'>('score');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'Điểm cộng',
    points: 1,
    notes: '',
    quality: 'Chăm chỉ',
    competency: 'Giải quyết vấn đề',
    grade: 4.5,
    starType: 'Học tập',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return alert('Vui lòng chọn học sinh');
    
    setLoading(true);
    try {
      const payload: any = {
        Student_ID: formData.studentId,
        Người_chấm: 'Giáo viên',
        Người_đánh_giá: 'Giáo viên',
        Người_tặng: 'Giáo viên'
      };

      if (activeTab === 'score') {
        await api.saveScore({
          ...payload,
          Loại_điểm: formData.type,
          Điểm_số: formData.points,
          Ghi_chú: formData.notes
        });
      } else if (activeTab === 'assessment') {
        await api.saveAssessment({
          ...payload,
          type: 'quality',
          Phẩm_chất: formData.quality,
          Điểm_đánh_giá: formData.grade,
          Nhận_xét: formData.notes
        });
      } else {
        await api.saveStar({
          ...payload,
          Loại_sao: formData.starType,
          Lý_do: formData.reason,
          Tuần: 1
        });
      }

      alert('Đã lưu thành công!');
      onSave();
      setFormData(prev => ({ ...prev, reason: '', notes: '' }));
    } catch (err) {
      alert('Lỗi: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('score')}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'score' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}
          >
            Ghi điểm
          </button>
          <button 
            onClick={() => setActiveTab('assessment')}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'assessment' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}
          >
            Đánh giá NL/PC
          </button>
          <button 
            onClick={() => setActiveTab('star')}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'star' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600' : 'text-slate-400'}`}
          >
            Tặng sao
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Chọn học sinh</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              >
                <option value="">-- Chọn học sinh --</option>
                {students.map(s => (
                  <option key={s.ID} value={s.ID}>{s.Họ_và_tên} ({s.ID})</option>
                ))}
              </select>
            </div>

            {activeTab === 'score' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Loại điểm</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Điểm cộng">Điểm cộng</option>
                    <option value="Điểm trừ">Điểm trừ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Điểm số</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                  />
                </div>
              </>
            )}

            {activeTab === 'assessment' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Hạng mục</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                  >
                    <option value="Yêu nước">Yêu nước</option>
                    <option value="Nhân ái">Nhân ái</option>
                    <option value="Chăm chỉ">Chăm chỉ</option>
                    <option value="Trung thực">Trung thực</option>
                    <option value="Trách nhiệm">Trách nhiệm</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Điểm đánh giá (1-5)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: parseFloat(e.target.value) })}
                    min="1"
                    max="5"
                  />
                </div>
              </>
            )}

            {activeTab === 'star' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Loại sao</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.starType}
                  onChange={(e) => setFormData({ ...formData, starType: e.target.value })}
                >
                  <option value="Học tập">Học tập 📚</option>
                  <option value="Kỷ luật">Kỷ luật 👂</option>
                  <option value="Văn nghệ">Văn nghệ 🎸</option>
                  <option value="Thể thao">Thể thao 🏃</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              {activeTab === 'star' ? 'Lý do tặng' : 'Ghi chú / Nhận xét'}
            </label>
            <textarea 
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Nhập chi tiết tại đây..."
              value={activeTab === 'star' ? formData.reason : formData.notes}
              onChange={(e) => setFormData({ ...formData, [activeTab === 'star' ? 'reason' : 'notes']: e.target.value })}
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200'
            }`}
          >
            {loading ? 'Đang xử lý...' : 'LƯU DỮ LIỆU'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScoringView;
