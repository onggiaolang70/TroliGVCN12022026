-- =====================================================
-- SUPABASE DATABASE SCHEMA - Hệ thống Quản lý Lớp học
-- Chạy toàn bộ script này trong Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. BẢNG USERS - Tài khoản người dùng
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'admin', 'student')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. BẢNG STUDENTS - Thông tin học sinh
-- =====================================================
CREATE TABLE students (
    id TEXT PRIMARY KEY, -- HS001, HS002, etc.
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    total_score NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Đang học',
    notes TEXT,
    total_stars INTEGER DEFAULT 0,
    avg_quality_score NUMERIC DEFAULT 0, -- Điểm TB 5PC
    avg_competency_score NUMERIC DEFAULT 0, -- Điểm TB 10NL
    parent_email TEXT,
    parent_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. BẢNG SCORES - Điểm số học sinh
-- =====================================================
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,
    score_type TEXT NOT NULL CHECK (score_type IN ('Điểm cộng', 'Điểm trừ')),
    points NUMERIC NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Hoạt động',
    graded_by TEXT,
    graded_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_scores_student ON scores(student_id);
CREATE INDEX idx_scores_date ON scores(score_date);

-- =====================================================
-- 4. BẢNG STAR_AWARDS - Tặng sao học sinh
-- =====================================================
CREATE TABLE star_awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    award_date DATE NOT NULL DEFAULT CURRENT_DATE,
    star_type TEXT NOT NULL,
    reason TEXT,
    week_number INTEGER,
    status TEXT DEFAULT 'Hoạt động',
    awarded_by TEXT,
    awarded_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stars_student ON star_awards(student_id);
CREATE INDEX idx_stars_date ON star_awards(award_date);

-- =====================================================
-- 5. BẢNG QUALITY_ASSESSMENTS - Đánh giá phẩm chất
-- =====================================================
CREATE TABLE quality_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quality_type TEXT NOT NULL, -- Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm
    score NUMERIC NOT NULL CHECK (score BETWEEN 1 AND 5),
    notes TEXT,
    status TEXT DEFAULT 'Hoạt động',
    assessed_by TEXT,
    assessed_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quality_student ON quality_assessments(student_id);

-- =====================================================
-- 6. BẢNG COMPETENCY_ASSESSMENTS - Đánh giá năng lực
-- =====================================================
CREATE TABLE competency_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    competency_type TEXT NOT NULL, -- Tự chủ, Giao tiếp, Hợp tác, Giải quyết vấn đề, etc.
    score NUMERIC NOT NULL CHECK (score BETWEEN 1 AND 10),
    notes TEXT,
    status TEXT DEFAULT 'Hoạt động',
    assessed_by TEXT,
    assessed_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competency_student ON competency_assessments(student_id);

-- =====================================================
-- 7. BẢNG WEEKLY_PLANS - Kế hoạch tuần
-- =====================================================
CREATE TABLE weekly_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_number INTEGER NOT NULL,
    day_of_week TEXT NOT NULL,
    content TEXT NOT NULL,
    time_slot TEXT,
    location TEXT,
    responsible_person TEXT DEFAULT 'GVCN',
    status TEXT DEFAULT 'Hoạt động' CHECK (status IN ('Hoạt động', 'Hoàn thành', 'Đã hủy')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_week ON weekly_plans(week_number);

-- =====================================================
-- 8. BẢNG NOTIFICATIONS - Thông báo
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'urgent', 'important', 'success')),
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_time TIME NOT NULL DEFAULT CURRENT_TIME,
    created_by TEXT NOT NULL,
    status TEXT DEFAULT 'Hoạt động',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_date ON notifications(created_date DESC);

-- =====================================================
-- 9. TRIGGERS - Tự động cập nhật updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_plans_updated_at BEFORE UPDATE ON weekly_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. FUNCTIONS - Tính toán tự động
-- =====================================================

-- Function để cập nhật tổng điểm học sinh
CREATE OR REPLACE FUNCTION update_student_total_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE students
    SET total_score = (
        SELECT COALESCE(
            SUM(CASE 
                WHEN score_type = 'Điểm cộng' THEN points
                WHEN score_type = 'Điểm trừ' THEN -points
                ELSE 0
            END), 0)
        FROM scores
        WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
        AND status = 'Hoạt động'
    )
    WHERE id = COALESCE(NEW.student_id, OLD.student_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_score
    AFTER INSERT OR UPDATE OR DELETE ON scores
    FOR EACH ROW EXECUTE FUNCTION update_student_total_score();

-- Function để cập nhật tổng sao
CREATE OR REPLACE FUNCTION update_student_total_stars()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE students
    SET total_stars = (
        SELECT COUNT(*)
        FROM star_awards
        WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
        AND status = 'Hoạt động'
    )
    WHERE id = COALESCE(NEW.student_id, OLD.student_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_stars
    AFTER INSERT OR UPDATE OR DELETE ON star_awards
    FOR EACH ROW EXECUTE FUNCTION update_student_total_stars();

-- Function để cập nhật điểm TB phẩm chất
CREATE OR REPLACE FUNCTION update_student_avg_quality()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE students
    SET avg_quality_score = (
        SELECT COALESCE(AVG(score), 0)
        FROM quality_assessments
        WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
        AND status = 'Hoạt động'
    )
    WHERE id = COALESCE(NEW.student_id, OLD.student_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_avg_quality
    AFTER INSERT OR UPDATE OR DELETE ON quality_assessments
    FOR EACH ROW EXECUTE FUNCTION update_student_avg_quality();

-- Function để cập nhật điểm TB năng lực
CREATE OR REPLACE FUNCTION update_student_avg_competency()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE students
    SET avg_competency_score = (
        SELECT COALESCE(AVG(score), 0)
        FROM competency_assessments
        WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
        AND status = 'Hoạt động'
    )
    WHERE id = COALESCE(NEW.student_id, OLD.student_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_avg_competency
    AFTER INSERT OR UPDATE OR DELETE ON competency_assessments
    FOR EACH ROW EXECUTE FUNCTION update_student_avg_competency();

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS) - Bảo mật
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE star_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for authenticated users (sẽ custom sau)
-- Tạm thời cho phép tất cả để test
CREATE POLICY "Allow all for authenticated users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON students
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON scores
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON star_awards
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON quality_assessments
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON competency_assessments
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON weekly_plans
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON notifications
    FOR ALL USING (true);

-- =====================================================
-- 12. DỮ LIỆU MẪU
-- =====================================================

-- Insert sample teacher account
INSERT INTO users (email, password, name, role) VALUES
('teacher@gmail.com', '123456', 'Nguyễn Hữu Phúc', 'teacher'),
('admin@gmail.com', 'admin123', 'Quản trị viên', 'admin');

-- Insert sample students
INSERT INTO students (id, full_name, date_of_birth, gender, email, phone, address, parent_email, parent_phone) VALUES
('HS001', 'Nguyễn Văn An', '2014-01-10', 'Nam', 'an@email.com', '0901234567', 'Hà Nội', 'parent1@email.com', '0909876543'),
('HS002', 'Lê Thị Bình', '2014-05-22', 'Nữ', 'binh@email.com', '0901234568', 'Hà Nội', 'parent2@email.com', '0909876544'),
('HS003', 'Trần Văn Cường', '2014-03-15', 'Nam', 'cuong@email.com', '0901234569', 'Hà Nội', 'parent3@email.com', '0909876545');

-- Insert sample user accounts for students
INSERT INTO users (email, password, name, role) VALUES
('an@email.com', '2014-01-10', 'Nguyễn Văn An', 'student'),
('binh@email.com', '2014-05-22', 'Lê Thị Bình', 'student'),
('cuong@email.com', '2014-03-15', 'Trần Văn Cường', 'student');

-- Insert sample scores
INSERT INTO scores (student_id, score_type, points, notes, graded_by) VALUES
('HS001', 'Điểm cộng', 5, 'Hoàn thành bài tập tốt', 'Giáo viên'),
('HS001', 'Điểm cộng', 3, 'Giúp bạn', 'Giáo viên'),
('HS002', 'Điểm cộng', 4, 'Tham gia tích cực', 'Giáo viên');

-- Insert sample star awards
INSERT INTO star_awards (student_id, star_type, reason, week_number, awarded_by) VALUES
('HS001', 'Học tập', 'Điểm kiểm tra cao', 1, 'Giáo viên'),
('HS002', 'Kỷ luật', 'Đi học đúng giờ', 1, 'Giáo viên');

-- Insert sample notifications
INSERT INTO notifications (title, content, type, created_by) VALUES
('Lịch thi học kỳ', 'Lịch thi học kỳ 1 sẽ bắt đầu từ tuần sau. Các em chuẩn bị ôn tập kỹ.', 'urgent', 'Nguyễn Hữu Phúc'),
('Thông báo nghỉ học', 'Thứ 7 tuần này nghỉ học do thời tiết xấu.', 'important', 'Nguyễn Hữu Phúc'),
('Chúc mừng học sinh xuất sắc', 'Chúc mừng các em đạt điểm cao trong kỳ thi vừa qua!', 'success', 'Nguyễn Hữu Phúc');

-- Insert sample weekly plans
INSERT INTO weekly_plans (week_number, day_of_week, content, time_slot, location) VALUES
(1, 'Thứ 2', 'Chào cờ đầu tuần', '07:30', 'Sân trường'),
(1, 'Thứ 3', 'Sinh hoạt lớp', '15:00', 'Phòng học'),
(1, 'Thứ 5', 'Tập văn nghệ', '16:00', 'Hội trường');

-- =====================================================
-- HOÀN THÀNH!
-- Bây giờ bạn có thể kết nối frontend với Supabase
-- =====================================================
