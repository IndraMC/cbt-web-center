import { useState, useEffect } from 'react'
import { History, TrendingUp, Award } from 'lucide-react'
import { getStudentHistory } from '../lib/api'
import { Loader, EmptyState, ScoreChip } from '../components/UI'

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function StudentHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudentHistory()
      .then(r => setHistory(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const avgScore = history.length ? Math.round(history.reduce((a, b) => a + b.percentScore, 0) / history.length) : 0
  const passed = history.filter(h => h.isPassed).length

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title"><History size={24} /> Riwayat Ujian</h2>
      </div>
      <div className="accent-strip" style={{ background: 'var(--accent-pink)' }} />

      {history.length > 0 && (
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="neo-card stat-card" style={{ borderLeftWidth: 5, borderLeftColor: 'var(--accent-blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-value">{history.length}</span>
              <History size={24} style={{ opacity: 0.4 }} />
            </div>
            <span className="stat-label">Total Ujian</span>
          </div>
          <div className="neo-card stat-card" style={{ borderLeftWidth: 5, borderLeftColor: 'var(--accent-green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-value">{avgScore}%</span>
              <TrendingUp size={24} style={{ opacity: 0.4 }} />
            </div>
            <span className="stat-label">Rata-rata Skor</span>
          </div>
          <div className="neo-card stat-card" style={{ borderLeftWidth: 5, borderLeftColor: 'var(--accent-yellow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-value">{passed}</span>
              <Award size={24} style={{ opacity: 0.4 }} />
            </div>
            <span className="stat-label">Lulus</span>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <EmptyState icon={History} message="Belum ada riwayat ujian" />
      ) : (
        <div className="neo-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="neo-table striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ujian</th>
                  <th>Nilai</th>
                  <th>Skor Mentah</th>
                  <th>Status</th>
                  <th>Waktu Kumpul</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={h.submissionId}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td style={{ fontWeight: 700 }}>{h.assignmentTitle}</td>
                    <td><ScoreChip score={h.percentScore} passing={70} /></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {h.rawScore}/{h.totalPoints}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                        padding: '3px 10px', border: '2px solid', borderRadius: 2,
                        background: h.isPassed ? 'var(--accent-green)' : '#ffcccc',
                        borderColor: 'var(--border)',
                      }}>
                        {h.isPassed ? '✓ LULUS' : '✗ TIDAK LULUS'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(h.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
