import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Clock, CheckSquare, TrendingUp, ChevronRight, BookOpen, Award, AlertCircle } from 'lucide-react'
import { getStudentDashboard } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { Loader, StatusBadge } from '../components/UI'

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDuration(min) {
  if (min < 60) return `${min} menit`
  return `${Math.floor(min / 60)} jam ${min % 60 > 0 ? min % 60 + ' menit' : ''}`
}

export default function StudentDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { student } = useAuth()

  useEffect(() => {
    getStudentDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const stats = data?.stats || {}
  const tasks = data?.upcomingTasks || []

  return (
    <div className="fade-up">
      {/* Welcome */}
      <div className="neo-card" style={{
        padding: '24px 28px',
        marginBottom: 24,
        background: 'var(--border)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Selamat datang kembali 👋
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginTop: 4 }}>
            {student?.fullName || data?.student?.fullName || 'Siswa'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#ccc', marginTop: 4 }}>
            Kelas: <strong style={{ color: 'var(--accent-yellow)' }}>{student?.classRoom?.name || data?.student?.classRoom || '-'}</strong>
          </p>
        </div>
        <BookOpen size={48} color="var(--accent-yellow)" style={{ opacity: 0.7 }} />
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Tugas',   value: stats.totalAssignments ?? 0, icon: ClipboardList, bg: 'var(--accent-yellow)' },
          { label: 'Selesai',       value: stats.completed ?? 0,        icon: CheckSquare,   bg: 'var(--accent-green)' },
          { label: 'Belum Selesai', value: stats.pending ?? 0,          icon: Clock,         bg: 'var(--accent-blue)' },
          { label: 'Rata-rata',     value: `${stats.averageScore ?? 0}%`, icon: TrendingUp,   bg: 'var(--accent-pink)' },
        ].map(({ label, value, icon: Icon, bg }) => (
          <div key={label} className="neo-card stat-card" style={{ borderLeftColor: bg, borderLeftWidth: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-value">{value}</span>
              <div style={{ background: bg, border: '2px solid var(--border)', borderRadius: 4, padding: 8 }}>
                <Icon size={20} />
              </div>
            </div>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming Tasks */}
      <div className="section-header">
        <h3 className="section-title"><ClipboardList size={22} /> Daftar Ujian</h3>
        <Link to="/tasks" className="neo-btn neo-btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
          Lihat Semua <ChevronRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.length === 0 ? (
          <div className="neo-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ fontWeight: 700 }}>Belum ada ujian tersedia</p>
          </div>
        ) : tasks.slice(0, 5).map(task => (
          <div key={task.assignmentId} className="neo-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{task.title}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{formatDuration(task.duration)}</span>
                <span>s/d {formatDate(task.endAt)}</span>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatusBadge status={task.status} />
              {task.status === 'not_started' && (
                <Link to={`/exam/${task.assignmentId}`} className="neo-btn neo-btn-primary" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
                  Mulai <ChevronRight size={14} />
                </Link>
              )}
              {task.status === 'in_progress' && (
                <Link to={`/exam/${task.assignmentId}`} className="neo-btn" style={{
                  padding: '8px 14px',
                  fontSize: '0.78rem',
                  background: 'var(--accent-yellow)',
                  border: '2px solid var(--border)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '2px 2px 0 var(--border)',
                }}>
                  ▶ Lanjutkan
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Award */}
      {stats.completed > 0 && (
        <div className="neo-card" style={{ padding: '16px 20px', marginTop: 16, background: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Award size={24} />
          <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>
            Kamu sudah menyelesaikan {stats.completed} ujian! Terus semangat 🎉
          </p>
        </div>
      )}
    </div>
  )
}
