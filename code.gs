
/**
 * GOOGLE APPS SCRIPT BACKEND v3.2
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doPost(e) {
  let request;
  try {
    request = JSON.parse(e.postData.contents);
  } catch(err) {
    return createResponse(false, "Invalid JSON input");
  }
  
  const action = request.action;
  const data = request.data;
  
  try {
    let result;
    switch (action) {
      case 'login':
        result = handleLogin(data.email, data.password);
        break;
      case 'getDashboardData':
        result = getDashboardData();
        break;
      case 'getStudents':
        result = getAllData('Students');
        break;
      case 'getStudentDetail':
        result = getStudentDetail(data.studentId);
        break;
      case 'saveScore':
        result = addRow('Scores', data);
        updateStudentTotalScore(data.Student_ID);
        break;
      case 'saveAssessment':
        const sheetName = data.type === 'quality' ? 'QualityAssessments' : 'CompetencyAssessments';
        result = addRow(sheetName, data);
        break;
      case 'saveStar':
        result = addRow('StarAwards', data);
        updateStudentTotalStars(data.Student_ID);
        break;
      case 'saveWeeklyPlan':
        result = addRow('WeeklyPlans', data);
        break;
      case 'saveNotification':
        result = addRow('Notifications', data);
        break;
      case 'getWeeklyPlans':
        result = getAllData('WeeklyPlans');
        break;
      case 'getNotifications':
        result = getAllData('Notifications');
        break;
      default:
        throw new Error('Action ' + action + ' not found');
    }
    return createResponse(true, result);
  } catch (error) {
    return createResponse(false, error.toString());
  }
}

function createResponse(success, dataOrError) {
  const result = success ? { success: true, data: dataOrError } : { success: false, error: dataOrError };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleLogin(username, password) {
  const users = getAllData('Users');
  const students = getAllData('Students');

  // 1. Check in 'Users' sheet first
  const userAccount = users.find(u => u.Email === username && u.Mật_khẩu.toString() === password.toString());
  
  if (userAccount) {
    logLoginTime(username);
    if (userAccount.Vai_trò === 'student') {
      const studentProfile = students.find(s => s.Email === username);
      if (studentProfile) {
         return { id: studentProfile.ID, email: userAccount.Email, name: userAccount.Họ_tên, role: 'student' };
      } else {
         return { id: 'UNKNOWN', email: userAccount.Email, name: userAccount.Họ_tên, role: 'student' };
      }
    }
    return { id: userAccount.ID, email: userAccount.Email, name: userAccount.Họ_tên, role: userAccount.Vai_trò || 'teacher' };
  }

  // 2. Fallback: Student Login via ID + DOB
  const studentByCode = students.find(s => s.ID === username);

  if (studentByCode) {
    const dob = studentByCode.Ngày_sinh ? new Date(studentByCode.Ngày_sinh) : null;
    let isMatch = false;
    
    if (dob) {
        if (studentByCode.Ngày_sinh.toString().includes(password)) isMatch = true;
        const d = dob.getDate().toString().padStart(2, '0');
        const m = (dob.getMonth() + 1).toString().padStart(2, '0');
        const y = dob.getFullYear();
        if (password === `${d}/${m}/${y}` || password === `${y}-${m}-${d}`) isMatch = true;
    } else {
        if (studentByCode.Ngày_sinh == password) isMatch = true;
    }

    if (isMatch) {
      return { id: studentByCode.ID, email: studentByCode.Email, name: studentByCode.Họ_và_tên, role: 'student' };
    }
  }

  throw new Error('Tài khoản hoặc mật khẩu không đúng');
}

function logLoginTime(email) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIdx = headers.indexOf('Email');
  const lastLoginIdx = headers.indexOf('Lần đăng nhập cuối');

  if (emailIdx === -1 || lastLoginIdx === -1) return;

  for (let i = 1; i < data.length; i++) {
    if (data[i][emailIdx] === email) {
      const now = new Date();
      const timeString = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN');
      sheet.getRange(i + 1, lastLoginIdx + 1).setValue(timeString);
      break;
    }
  }
}

function getAllData(sheetName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      const key = header.replace(/\s+/g, '_');
      obj[key] = row[i];
    });
    return obj;
  });
}

function getStudentDetail(studentId) {
  const students = getAllData('Students');
  const student = students.find(s => s.ID === studentId);
  if (!student) throw new Error('Student not found');

  const scores = getAllData('Scores')
    .filter(s => s.Student_ID === studentId)
    .map(s => ({
      Ngày: s.Ngày_chấm ? new Date(s.Ngày_chấm).toLocaleDateString('vi-VN') : '',
      Loại: s.Loại_điểm,
      Điểm: s.Điểm_số,
      Lý_do: s.Ghi_chú
    }));

  const stars = getAllData('StarAwards')
    .filter(s => s.Student_ID === studentId)
    .map(s => ({
      Ngày: s.Ngày_tặng ? new Date(s.Ngày_tặng).toLocaleDateString('vi-VN') : '',
      Loại: s.Loại_sao,
      Lý_do: s.Lý_do
    }));

  return {
    ...student,
    scoreHistory: scores,
    starHistory: stars
  };
}

function addRow(sheetName, data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const headers = sheet.getDataRange().getValues()[0];
  
  // Auto Generate ID based on sheet
  if (!data.ID) {
    if (sheetName === 'WeeklyPlans') {
      data.ID = 'P' + new Date().getTime();
    } else if (sheetName === 'Notifications') {
      data.ID = 'TB' + new Date().getTime().toString().slice(-6);
    }
  }

  const newRow = headers.map(header => {
    const key = header.replace(/\s+/g, '_');
    return data[key] !== undefined ? data[key] : '';
  });
  sheet.appendRow(newRow);
  return { success: true };
}

function updateStudentTotalScore(studentId) {
  const scoreSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Scores');
  const scoreData = scoreSheet.getDataRange().getValues();
  const headers = scoreData[0];
  const sIdIdx = headers.indexOf('Student ID');
  const pointsIdx = headers.indexOf('Điểm số');
  const typeIdx = headers.indexOf('Loại điểm');
  
  let total = 0;
  for (let i = 1; i < scoreData.length; i++) {
    if (scoreData[i][sIdIdx] === studentId) {
      const pts = parseFloat(scoreData[i][pointsIdx]) || 0;
      if (scoreData[i][typeIdx] === 'Điểm cộng') total += pts;
      else if (scoreData[i][typeIdx] === 'Điểm trừ') total -= pts;
    }
  }
  updateStudentField(studentId, 'Tổng điểm', total);
}

function updateStudentTotalStars(studentId) {
  const starSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('StarAwards');
  const starData = starSheet.getDataRange().getValues();
  const headers = starData[0];
  const sIdIdx = headers.indexOf('Student ID');
  let count = 0;
  for (let i = 1; i < starData.length; i++) {
    if (starData[i][sIdIdx] === studentId) count++;
  }
  updateStudentField(studentId, 'Tổng sao', count);
}

function updateStudentField(studentId, fieldName, value) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Students');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const sIdIdx = headers.indexOf('ID');
  const fieldIdx = headers.indexOf(fieldName);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][sIdIdx] === studentId) {
      sheet.getRange(i + 1, fieldIdx + 1).setValue(value);
      break;
    }
  }
}

function getDashboardData() {
  const students = getAllData('Students');
  const notifications = getAllData('Notifications');
  const plans = getAllData('WeeklyPlans');
  
  return {
    stats: {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.Trạng_thái === 'Đang học').length,
      highPerformers: students.filter(s => parseFloat(s.Điểm_TB_5PC) >= 4.5).length
    },
    recentNotifications: notifications.slice(-5).reverse(),
    upcomingPlans: plans.filter(p => p.Trạng_thái === 'Hoạt động')
  };
}
