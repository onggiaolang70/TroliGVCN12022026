import { supabase } from '../supabaseClient';
import type { User, Student, Notification, WeeklyPlan, DashboardData, StudentDetailData } from '../types';

// =====================================================
// AUTHENTICATION
// =====================================================

export async function login(email: string, password: string): Promise<User> {
  try {
    // 1. Tìm user trong bảng users
    const { data: userAccount, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (userAccount && !userError) {
      // Cập nhật last_login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userAccount.id);

      // Nếu là student, lấy thêm thông tin từ bảng students
      if (userAccount.role === 'student') {
        const { data: studentProfile } = await supabase
          .from('students')
          .select('id')
          .eq('email', email)
          .single();

        return {
          id: studentProfile?.id || 'UNKNOWN',
          email: userAccount.email,
          name: userAccount.name,
          role: 'student'
        };
      }

      return {
        id: userAccount.id,
        email: userAccount.email,
        name: userAccount.name,
        role: userAccount.role
      };
    }

    // 2. Fallback: Student login bằng ID + Ngày sinh
    const { data: studentByCode } = await supabase
      .from('students')
      .select('*')
      .eq('id', email)
      .single();

    if (studentByCode) {
      const dob = new Date(studentByCode.date_of_birth);
      const dobString = dob.toISOString().split('T')[0]; // YYYY-MM-DD

      if (password === dobString || password === studentByCode.date_of_birth) {
        return {
          id: studentByCode.id,
          email: studentByCode.email,
          name: studentByCode.full_name,
          role: 'student'
        };
      }
    }

    throw new Error('Tài khoản hoặc mật khẩu không đúng');
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Đăng nhập thất bại');
  }
}

// =====================================================
// DASHBOARD
// =====================================================

export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Get students stats
    const { data: students } = await supabase
      .from('students')
      .select('status, avg_quality_score');

    const totalStudents = students?.length || 0;
    const activeStudents = students?.filter(s => s.status === 'Đang học').length || 0;
    const highPerformers = students?.filter(s => parseFloat(s.avg_quality_score) >= 4.5).length || 0;

    // Get recent notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get upcoming plans
    const { data: plans } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('status', 'Hoạt động')
      .order('week_number', { ascending: true })
      .limit(5);

    return {
      stats: {
        totalStudents,
        activeStudents,
        highPerformers
      },
      recentNotifications: (notifications || []).map(mapNotification),
      upcomingPlans: (plans || []).map(mapWeeklyPlan)
    };
  } catch (error) {
    console.error('Dashboard error:', error);
    throw error;
  }
}

// =====================================================
// STUDENTS
// =====================================================

export async function getStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return (data || []).map(mapStudent);
  } catch (error) {
    console.error('Get students error:', error);
    throw error;
  }
}

export async function getStudentDetail(studentId: string): Promise<StudentDetailData> {
  try {
    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    // Get score history
    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('student_id', studentId)
      .order('score_date', { ascending: false });

    // Get star history
    const { data: stars } = await supabase
      .from('star_awards')
      .select('*')
      .eq('student_id', studentId)
      .order('award_date', { ascending: false });

    const scoreHistory = (scores || []).map(s => ({
      Ngày: new Date(s.score_date).toLocaleDateString('vi-VN'),
      Loại: s.score_type,
      Điểm: s.points,
      Lý_do: s.notes || ''
    }));

    const starHistory = (stars || []).map(s => ({
      Ngày: new Date(s.award_date).toLocaleDateString('vi-VN'),
      Loại: s.star_type,
      Lý_do: s.reason || ''
    }));

    return {
      ...mapStudent(student),
      scoreHistory,
      starHistory
    };
  } catch (error) {
    console.error('Get student detail error:', error);
    throw error;
  }
}

// =====================================================
// SCORING
// =====================================================

export async function saveScore(data: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('scores')
      .insert({
        student_id: data.Student_ID,
        score_date: new Date().toISOString().split('T')[0],
        score_type: data.Loại_điểm,
        points: data.Điểm_số,
        notes: data.Ghi_chú,
        status: 'Hoạt động',
        graded_by: data.Người_chấm,
        graded_time: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Save score error:', error);
    throw error;
  }
}

export async function saveAssessment(data: any): Promise<void> {
  try {
    const tableName = data.type === 'quality' ? 'quality_assessments' : 'competency_assessments';
    
    const { error } = await supabase
      .from(tableName)
      .insert({
        student_id: data.Student_ID,
        assessment_date: new Date().toISOString().split('T')[0],
        [data.type === 'quality' ? 'quality_type' : 'competency_type']: data.Phẩm_chất || data.Năng_lực,
        score: data.Điểm_đánh_giá,
        notes: data.Nhận_xét,
        status: 'Hoạt động',
        assessed_by: data.Người_đánh_giá,
        assessed_time: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Save assessment error:', error);
    throw error;
  }
}

export async function saveStar(data: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('star_awards')
      .insert({
        student_id: data.Student_ID,
        award_date: new Date().toISOString().split('T')[0],
        star_type: data.Loại_sao,
        reason: data.Lý_do,
        week_number: data.Tuần,
        status: 'Hoạt động',
        awarded_by: data.Người_tặng,
        awarded_time: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Save star error:', error);
    throw error;
  }
}

// =====================================================
// WEEKLY PLANS
// =====================================================

export async function getWeeklyPlans(): Promise<WeeklyPlan[]> {
  try {
    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*')
      .order('week_number', { ascending: true });

    if (error) throw error;

    return (data || []).map(mapWeeklyPlan);
  } catch (error) {
    console.error('Get weekly plans error:', error);
    throw error;
  }
}

export async function saveWeeklyPlan(data: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('weekly_plans')
      .insert({
        week_number: data.Tuần,
        day_of_week: data.Thứ,
        content: data.Nội_dung,
        time_slot: data.Thời_gian,
        location: data.Địa_điểm,
        responsible_person: data.Người_phụ_trách,
        status: data.Trạng_thái
      });

    if (error) throw error;
  } catch (error) {
    console.error('Save weekly plan error:', error);
    throw error;
  }
}

// =====================================================
// NOTIFICATIONS
// =====================================================

export async function getNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(mapNotification);
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
}

export async function saveNotification(data: any): Promise<void> {
  try {
    const now = new Date();
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        title: data.Tiêu_đề,
        content: data.Nội_dung,
        type: data.Loại,
        created_date: now.toISOString().split('T')[0],
        created_time: now.toTimeString().split(' ')[0],
        created_by: data.Người_tạo,
        status: data.Trạng_thái
      });

    if (error) throw error;
  } catch (error) {
    console.error('Save notification error:', error);
    throw error;
  }
}

// =====================================================
// MAPPING FUNCTIONS
// =====================================================

function mapStudent(s: any): Student {
  return {
    ID: s.id,
    Họ_và_tên: s.full_name,
    Ngày_sinh: s.date_of_birth,
    Giới_tính: s.gender || '',
    Email: s.email || '',
    Số_điện_thoại: s.phone || '',
    Địa_chỉ: s.address || '',
    Tổng_điểm: s.total_score || 0,
    Trạng_thái: s.status || '',
    Ghi_chú: s.notes || '',
    Tổng_sao: s.total_stars || 0,
    Điểm_TB_5PC: s.avg_quality_score || 0,
    Điểm_TB_10NL: s.avg_competency_score || 0,
    Email_phụ_huynh: s.parent_email || '',
    SĐT_phụ_huynh: s.parent_phone || ''
  };
}

function mapNotification(n: any): Notification {
  return {
    ID: n.id,
    Tiêu_đề: n.title,
    Nội_dung: n.content,
    Loại: n.type,
    Ngày_tạo: new Date(n.created_date).toLocaleDateString('vi-VN'),
    Thời_gian: n.created_time,
    Người_tạo: n.created_by,
    Trạng_thái: n.status
  };
}

function mapWeeklyPlan(p: any): WeeklyPlan {
  return {
    ID: p.id,
    Tuần: p.week_number,
    Thứ: p.day_of_week,
    Nội_dung: p.content,
    Thời_gian: p.time_slot || '',
    Địa_điểm: p.location || '',
    Người_phụ_trách: p.responsible_person || '',
    Trạng_thái: p.status
  };
}
