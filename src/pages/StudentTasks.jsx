import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, ChevronRight, Search } from 'lucide-react'
import { getStudentTasks } from '../lib/api'
import { Loader, StatusBadge, EmptyState } from '../components/UI'

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function StudentTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getStudentTasks()
      .then(r => setTasks(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Loader />

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title"><ClipboardList size={24} /> Daftar Ujian</h2>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="neo-input" placeholder="Cari ujian..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, width: 200 }} />
        </div>
      </div>
      <div className="accent-strip" />

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} message="Tidak ada ujian ditemukan" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(task => (
            <div key={task.assignmentId} className="neo-card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>{task.title}</h3>
                    <StatusBadge status={task.submissionStatus} />
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    <span><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />{task.duration} menit</span>
                    <span>📝 {task.totalQuestions} soal</span>
                    <span>🏆 {task.passingScore}% lulus</span>
                    <span>📅 s/d {formatDate(task.endAt)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  {task.score != null && (
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem',
                      color: task.score >= task.passingScore ? 'var(--accent-green)' : '#ff4444',
                    }}>
                      {task.score}%
                    </div>
                  )}
                  {task.submissionStatus === 'not_started' && (
                    <Link to={`/exam/${task.assignmentId}`} className="neo-btn neo-btn-primary" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
                      Mulai Ujian <ChevronRight size={14} />
                    </Link>
                  )}
                  {task.submissionStatus === 'submitted' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>✓ Selesai</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
