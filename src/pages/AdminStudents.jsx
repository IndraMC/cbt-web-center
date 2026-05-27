import { useState, useEffect } from 'react'
import { Users, Search } from 'lucide-react'
import { getStudents } from '../lib/api'
import { Loader, EmptyState, Badge } from '../components/UI'

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  function load(p = 1, s = '') {
    setLoading(true)
    getStudents(p, s)
      .then(r => {
        setStudents(r.data?.students || [])
        setPagination(r.data?.pagination || {})
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1, '') }, [])

  function handleSearch(e) {
    const v = e.target.value
    setSearch(v)
    setPage(1)
    load(1, v)
  }

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title"><Users size={24} /> Data Siswa</h2>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="neo-input" placeholder="Cari siswa..." value={search}
            onChange={handleSearch} style={{ paddingLeft: 36, width: 220 }} />
        </div>
      </div>
      <div className="accent-strip" style={{ background: 'var(--accent-blue)' }} />

      {loading ? <Loader /> : students.length === 0 ? (
        <EmptyState icon={Users} message="Tidak ada siswa ditemukan" />
      ) : (
        <>
          <div className="neo-card" style={{ overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="neo-table striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Kelas</th>
                    <th>Status</th>
                    <th>Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.studentId}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {(page - 1) * (pagination.limit || 20) + i + 1}
                      </td>
                      <td style={{ fontWeight: 700 }}>{s.fullName}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.email}</td>
                      <td>
                        <Badge color="yellow">{s.classRoom?.name || '-'}</Badge>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px',
                          border: '2px solid var(--border)', borderRadius: 2,
                          background: s.isActive ? 'var(--accent-green)' : '#e0e0e0',
                        }}>
                          {s.isActive ? '✓ AKTIF' : 'NONAKTIF'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(s.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`neo-btn ${p === page ? 'neo-btn-dark' : 'neo-btn-ghost'}`}
                  onClick={() => { setPage(p); load(p, search) }}
                  style={{ padding: '6px 12px', minWidth: 36 }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: 12 }}>
            Total: {pagination.total || students.length} siswa
          </p>
        </>
      )}
    </div>
  )
}
