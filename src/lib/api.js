const BASE_URL = ''
function getToken(role = 'student') {
  return localStorage.getItem(role === 'admin' ? 'cbt_admin_token' : 'cbt_student_token')
}

function authHeaders(role = 'student') {
  const token = getToken(role)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(method, path, body, role = 'student') {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(role),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

// AUTH
export const adminLogin = (email, password) =>
  request('POST', '/api/admin/login', { email, password })

export const studentLogin = (email, password) =>
  request('POST', '/api/auth/login', { email, password })

export const studentRegister = (fullName, email, password, classCode) =>
  request('POST', '/api/auth/register', { fullName, email, password, classCode })

// ADMIN - Classes
export const getClasses = () =>
  request('GET', '/api/admin/classes', null, 'admin')

export const createClass = (body) =>
  request('POST', '/api/admin/classes', body, 'admin')

// ADMIN - Students
export const getStudents = (page = 1, search = '') =>
  request('GET', `/api/admin/students?page=${page}&search=${encodeURIComponent(search)}`, null, 'admin')

// ADMIN - Assignments
export const getAssignments = () =>
  request('GET', '/api/admin/tasks', null, 'admin')

export const createAssignment = (body) =>
  request('POST', '/api/admin/tasks', body, 'admin')

export const updateAssignment = (id, body) =>
  request('PATCH', `/api/admin/tasks/${id}`, body, 'admin')

export const deleteAssignment = (id) =>
  request('DELETE', `/api/admin/tasks/${id}`, null, 'admin')

// ADMIN - Submissions
export const getSubmissions = (assignmentId) =>
  request('GET', `/api/admin/submissions?assignmentId=${assignmentId}`, null, 'admin')

// STUDENT
export const getStudentDashboard = () =>
  request('GET', '/api/student/dashboard', null, 'student')

export const getStudentTasks = () =>
  request('GET', '/api/student/tasks', null, 'student')

export const getStudentHistory = () =>
  request('GET', '/api/student/history', null, 'student')

export const startExam = (assignmentId) =>
  request('GET', `/api/tasks/${assignmentId}`, null, 'student')

export const submitExam = (assignmentId, submissionId, answers) =>
  request('POST', `/api/tasks/${assignmentId}/submit`, { submissionId, answers }, 'student')
