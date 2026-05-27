import { useState, useEffect } from 'react'
import { Users, BookOpen, ClipboardList, TrendingUp, Activity } from 'lucide-react'
import { getAssignments, getStudents, getClasses } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { Loader, StatusBadge } from '../components/UI'

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminDashboard() {
  const { admin } = useAuth()
  const [stats, setStats] = useState({ assignments: 0, students: 0, classes: 0, published: 0 })
  const [recentAssignments, setRecentAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAssignments(), getStudents(), getClasses()])
      .then(([a, s, c]) => {
        const asgn = a.data || []
        const stud = s.data?.students || []
        const cls = c.data || []
        setRecentAssignments(asgn.slice(0, 5))
        setStats({
          assignments: asgn.length,
          published: asgn.filter(x => x.status === 'published').length,
          students: s.data?.pagination?.total || stud.length,
          classes: cls.length,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="fade-up">
      {/* Welcome */}
      <div className="neo-card" style={{
        padding: '24px 28px', marginBottom: 24,
        background: 'var(--border)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Admin Panel
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginTop: 4 }}>
            Halo, {admin?.fullName || 'Admin'} 👋
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#ccc', marginTop: 4 }}>
            Role: <strong style={{ color: 'var(--accent-yellow)' }}>{admin?.role?.toUpperCase() || 'ADMIN'}</strong>
          </p>
        </div>
        <Activity size={48} color="var(--accent-yellow)" style={{ opacity: 0.7 }} />
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Siswa',     value: stats.students,     icon: Users,        bg: 'var(--accent-blue)' },
          { label: 'Total Kelas',     value: stats.classes,      icon: BookOpen,     bg: 'var(--accent-yellow)' },
          { label: 'Total Ujian',     value: stats.assignments,  icon: ClipboardList, bg: 'var(--accent-pink)' },
          { label: 'Ujian Aktif',     value: stats.published,    icon: TrendingUp,   bg: 'var(--accent-green)' },
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

      {/* Recent */}
      <h3 className="section-title" style={{ marginBottom: 16 }}><ClipboardList size={20} /> Ujian Terbaru</h3>
      <div className="neo-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="neo-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Kelas</th>
                <th>Status</th>
                <th>Dibuat</th>
                <th>Berakhir</th>
              </tr>
            </thead>
            <tbody>
              {recentAssignments.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 700 }}>{a.title}</td>
                  <td style={{ fontSize: '0.8rem' }}>{a.classRooms?.map(c => c.name).join(', ')}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(a.createdAt)}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(a.endAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
