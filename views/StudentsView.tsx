import React, { useState, useEffect } from 'react';
import { Student, StudentDetailData, User } from '../types';
import * as api from '../services/supabaseApi';

interface StudentsViewProps {
  students: Student[];
  currentUser: User;
}

const StudentsView: React.FC<StudentsViewProps> = ({ students, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const isStudent = currentUser.role === 'student';

  const filteredStudents = isStudent 
    ? students.filter(s => s.ID === currentUser.id) 
    : students.filter(s => 
        s.Họ_và_tên.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.ID.toLowerCase().includes(searchTerm.toLowerCase())
      );

  useEffect(() => {
    if (isStudent && filteredStudents.length === 1 && !selectedStudent) {
        handleViewDetail(filteredStudents[0].ID);
    }
  }, [isStudent, filteredStudents]);

  const handleViewDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getStudentDetail(id);
      setSelectedStudent(detail);
    } catch (error) {
      console.error('Không thể tải thông tin chi tiết: ' + error);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          {isStudent ? 'Hồ sơ Cá nhân' : 'Danh sách Học sinh'}
        </h2>
        
        {!isStudent && (
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã HS..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
        )}
      </div>

      {/* Main List Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        {filteredStudents.length === 0 ? (
           <div className="p-10 text-center text-slate-500">
             {isStudent 
               ? "Không tìm thấy dữ liệu học sinh của bạn. Vui lòng liên hệ GVCN." 
               : "Không tìm thấy học sinh nào."}
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Mã HS</th>
                  <th className="px-6 py-4">Họ và tên</th>
                  <th className="px-6 py-4">Ngày sinh</th>
                  <th className="px-6 py-4">Tổng điểm</th>
                  <th className="px-6 py-4 text-center">Sao</th>
                  <th className="px-6 py-4">TB 5PC</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr key={student.ID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-teal-600">{student.ID}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{student.Họ_và_tên}</div>
                      <div className="text-xs text-slate-400">{student.Email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.Ngày_sinh}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{student.Tổng_điểm}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        ⭐ {student.Tổng_sao || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-teal-500 h-full" 
                          style={{ width: `${(student.Điểm_TB_5PC / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500">{student.Điểm_TB_5PC}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        student.Trạng_thái === 'Đang học' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {student.Trạng_thái}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewDetail(student.ID)}
                        className="text-teal-600 hover:text-teal-800 font-medium text-sm border border-teal-200 px-3 py-1 rounded-lg hover:bg-teal-50 transition-all"
                      >
                        {loadingDetail && student.ID === (selectedStudent?.ID || '') ? '...' : 'Chi tiết'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loading Overlay for Detail */}
      {loadingDetail && !selectedStudent && (
        <div className="fixed inset-0 bg-white/50 z-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-zoomIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-xl">🎓</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedStudent.Họ_và_tên}</h3>
                  <p className="text-sm text-slate-500">Mã HS: <span className="font-mono text-teal-600">{selectedStudent.ID}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-teal-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-teal-600 font-bold uppercase">Tổng điểm</p>
                  <p className="text-2xl font-bold text-teal-800">{selectedStudent.Tổng_điểm}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-amber-600 font-bold uppercase">Tổng sao</p>
                  <p className="text-2xl font-bold text-amber-800">⭐ {selectedStudent.Tổng_sao}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-blue-600 font-bold uppercase">Điểm TB 5PC</p>
                  <p className="text-2xl font-bold text-blue-800">{selectedStudent.Điểm_TB_5PC}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-purple-600 font-bold uppercase">Điểm TB 10NL</p>
                  <p className="text-2xl font-bold text-purple-800">{selectedStudent.Điểm_TB_10NL}</p>
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">📋 Thông tin cá nhân</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg"><span className="text-slate-500">Ngày sinh:</span> <span className="font-medium">{selectedStudent.Ngày_sinh}</span></div>
                  <div className="p-3 bg-slate-50 rounded-lg"><span className="text-slate-500">Giới tính:</span> <span className="font-medium">{selectedStudent.Giới_tính}</span></div>
                  <div className="p-3 bg-slate-50 rounded-lg"><span className="text-slate-500">Email:</span> <span className="font-medium">{selectedStudent.Email}</span></div>
                  <div className="p-3 bg-slate-50 rounded-lg"><span className="text-slate-500">SĐT Phụ huynh:</span> <span className="font-medium">{selectedStudent.SĐT_phụ_huynh}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score History */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">📈 Lịch sử điểm số</h4>
                  <div className="bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto space-y-3">
                    {selectedStudent.scoreHistory.length > 0 ? selectedStudent.scoreHistory.map((h, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                        <div>
                          <p className={`font-bold ${h.Loại === 'Điểm cộng' ? 'text-green-600' : 'text-red-600'}`}>
                            {h.Loại === 'Điểm cộng' ? '+' : '-'}{h.Điểm} điểm
                          </p>
                          <p className="text-xs text-slate-500">{h.Lý_do}</p>
                        </div>
                        <span className="text-xs text-slate-400">{h.Ngày}</span>
                      </div>
                    )) : <p className="text-center text-slate-400 text-sm">Chưa có dữ liệu</p>}
                  </div>
                </div>

                {/* Star History */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🌟 Lịch sử nhận sao</h4>
                  <div className="bg-slate-50 rounded-xl p-4 max-h-60 overflow-y-auto space-y-3">
                    {selectedStudent.starHistory.length > 0 ? selectedStudent.starHistory.map((h, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                        <div>
                          <p className="font-bold text-amber-600">{h.Loại}</p>
                          <p className="text-xs text-slate-500">{h.Lý_do}</p>
                        </div>
                        <span className="text-xs text-slate-400">{h.Ngày}</span>
                      </div>
                    )) : <p className="text-center text-slate-400 text-sm">Chưa có dữ liệu</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsView;
