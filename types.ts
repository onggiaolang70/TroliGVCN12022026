
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'admin' | 'student';
}

export interface Student {
  ID: string;
  Họ_và_tên: string;
  Ngày_sinh: string;
  Giới_tính: string;
  Email: string;
  Số_điện_thoại: string;
  Địa_chỉ: string;
  Tổng_điểm: number;
  Trạng_thái: string;
  Ghi_chú: string;
  Tổng_sao: number;
  Điểm_TB_5PC: number;
  Điểm_TB_10NL: number;
  Email_phụ_huynh: string;
  SĐT_phụ_huynh: string;
}

export interface Notification {
  ID: string;
  Tiêu_đề: string;
  Nội_dung: string;
  Loại: 'info' | 'urgent' | 'success' | 'important';
  Ngày_tạo: string;
  Thời_gian: string;
  Người_tạo: string;
  Trạng_thái: string;
}

export interface WeeklyPlan {
  ID: string;
  Tuần: number;
  Thứ: string;
  Nội_dung: string;
  Thời_gian: string;
  Địa_điểm: string;
  Người_phụ_trách: string;
  Trạng_thái: 'Hoạt động' | 'Hoàn thành' | 'Đã hủy';
}

export interface DashboardData {
  stats: {
    totalStudents: number;
    activeStudents: number;
    highPerformers: number;
  };
  recentNotifications: Notification[];
  upcomingPlans: WeeklyPlan[];
}

export interface ScoreHistory {
  Ngày: string;
  Loại: string;
  Điểm: number;
  Lý_do: string;
}

export interface StarHistory {
  Ngày: string;
  Loại: string;
  Lý_do: string;
}

export interface StudentDetailData extends Student {
  scoreHistory: ScoreHistory[];
  starHistory: StarHistory[];
}
