import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Users, BookOpen, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const navItems = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/assignments',  icon: ClipboardList,   label: 'Ujian' },
  { to: '/admin/students',     icon: Users,           label: 'Siswa' },
  { to: '/admin/classes',      icon: BookOpen,        label: 'Kelas' },
]

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logoutAdmin()
    navigate('/admin/login')
  }

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="navbar-brand">
            <ShieldCheck size={20} /> ADMIN CBT
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: '#ccc', fontWeight: 700 }}>{admin?.fullName}</span>
            <button className="neo-btn neo-btn-danger" onClick={handleLogout} style={{ padding: '7px 12px', fontSize: '0.75rem' }}>
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </div>
      </nav>

      <div className="sidebar-layout">
        <aside className="sidebar">
          <div style={{ padding: '12px 20px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Admin Menu
          </div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ padding: '12px 20px', borderTop: '2px solid #e0e0e0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>{admin?.fullName}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{admin?.role}</div>
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
