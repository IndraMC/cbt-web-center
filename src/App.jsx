import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'

// Pages
import StudentLogin    from './pages/StudentLogin'
import StudentRegister from './pages/StudentRegister'
import AdminLogin      from './pages/AdminLogin'
import StudentDashboard from './pages/StudentDashboard'
import StudentTasks    from './pages/StudentTasks'
import StudentHistory  from './pages/StudentHistory'
import ExamPage        from './pages/ExamPage'
import AdminDashboard  from './pages/AdminDashboard'
import AdminAssignments from './pages/AdminAssignments'
import AdminStudents   from './pages/AdminStudents'
import AdminClasses    from './pages/AdminClasses'

// Layouts
import StudentLayout from './components/StudentLayout'
import AdminLayout   from './components/AdminLayout'

function RequireStudent({ children }) {
  const { student } = useAuth()
  return student ? children : <Navigate to="/login" replace />
}

function RequireAdmin({ children }) {
  const { admin } = useAuth()
  return admin ? children : <Navigate to="/admin/login" replace />
}

function RedirectIfStudent() {
  const { student } = useAuth()
  return student ? <Navigate to="/dashboard" replace /> : <StudentLogin />
}

function RedirectIfAdmin() {
  const { admin } = useAuth()
  return admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<RedirectIfStudent />} />
      <Route path="/register" element={<StudentRegister />} />
      <Route path="/admin/login" element={<RedirectIfAdmin />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Student */}
      <Route path="/" element={<RequireStudent><StudentLayout /></RequireStudent>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="tasks"     element={<StudentTasks />} />
        <Route path="history"   element={<StudentHistory />} />
        <Route path="exam/:id"  element={<ExamPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="dashboard"   element={<AdminDashboard />} />
        <Route path="assignments" element={<AdminAssignments />} />
        <Route path="students"    element={<AdminStudents />} />
        <Route path="classes"     element={<AdminClasses />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
