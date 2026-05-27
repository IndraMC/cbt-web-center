import { useState, useEffect } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { getClasses, createClass } from '../lib/api'
import { Loader, Alert, EmptyState } from '../components/UI'

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', code: '', academicYear: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function load() {
    setLoading(true)
    getClasses().then(r => setClasses(r.data || [])).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createClass(form)
      setSuccess('Kelas berhasil ditambahkan!')
      setForm({ name: '', code: '', academicYear: '' })
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title"><BookOpen size={24} /> Manajemen Kelas</h2>
      </div>
      <div className="accent-strip" style={{ background: 'var(--accent-green)' }} />

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Form */}
        <div className="neo-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 16 }}>Tambah Kelas Baru</h3>
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Nama Kelas</label>
              <input className="neo-input" placeholder="XII A" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Kode Kelas</label>
              <input className="neo-input" placeholder="XII-A" value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tahun Ajaran</label>
              <input className="neo-input" placeholder="2025/2026" value={form.academicYear}
                onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} required />
            </div>
            <button type="submit" className="neo-btn neo-btn-primary" disabled={saving}
              style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
              {saving ? 'Menyimpan...' : <><Plus size={16} /> Tambah Kelas</>}
            </button>
          </form>
        </div>

        {/* List */}
        <div>
          {loading ? <Loader /> : classes.length === 0 ? <EmptyState icon={BookOpen} message="Belum ada kelas" /> : (
            <div className="neo-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="neo-table striped">
                  <thead>
                    <tr><th>#</th><th>Nama</th><th>Kode</th><th>Tahun Ajaran</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {classes.map((c, i) => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{c.name}</td>
                        <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', background: 'var(--bg)', padding: '2px 6px', borderRadius: 2, border: '1px solid #e0e0e0' }}>{c.code}</code></td>
                        <td style={{ fontSize: '0.8rem' }}>{c.academicYear}</td>
                        <td>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px',
                            border: '2px solid var(--border)', borderRadius: 2,
                            background: c.isActive ? 'var(--accent-green)' : '#e0e0e0',
                          }}>
                            {c.isActive ? 'AKTIF' : 'NONAKTIF'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
