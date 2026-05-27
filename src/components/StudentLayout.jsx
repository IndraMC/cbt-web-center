import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, History, LogOut, BookOpen } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: ClipboardList,   label: 'Ujian' },
  { to: '/history',   icon: History,         label: 'Riwayat' },
]

export default function StudentLayout() {
  const { student, logoutStudent } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logoutStudent()
    navigate('/login')
  }

  return (
    <div className="page-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/dashboard" className="navbar-brand">
            <BookOpen size={22} /> CBT
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: '#ccc', fontWeight: 700, display: 'none' }}
              className="hide-mobile">
              {student?.fullName}
            </span>
            <button className="neo-btn neo-btn-danger" onClick={handleLogout} style={{ padding: '7px 12px', fontSize: '0.75rem' }}>
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar layout */}
      <div className="sidebar-layout">
        <aside className="sidebar">
          <div style={{ padding: '12px 20px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Menu
          </div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ padding: '12px 20px', borderTop: '2px solid #e0e0e0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>{student?.fullName}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{student?.classRoom?.name}</div>
          </div>
        </aside>

        <main className="sidebar-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
          <button className="mobile-nav-item" onClick={handleLogout}>
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </nav>
    </div>
  )
}
