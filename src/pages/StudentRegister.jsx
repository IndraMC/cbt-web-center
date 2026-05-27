import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { studentRegister } from '../lib/api'
import { Alert } from '../components/UI'

export default function StudentRegister() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', classCode: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  function update(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await studentRegister(form.fullName, form.email, form.password, form.classCode)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card fade-up">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
            DAFTAR AKUN
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4, fontWeight: 700 }}>
            Buat akun siswa baru
          </p>
          <div style={{ height: 4, background: 'var(--accent-pink)', border: '2px solid var(--border)', borderRadius: 2, marginTop: 10 }} />
        </div>

        <div className="neo-card" style={{ padding: 28 }}>
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">Berhasil! Mengalihkan ke login...</Alert>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input className="neo-input" type="text" placeholder="Budi Santoso"
                value={form.fullName} onChange={e => update('fullName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="neo-input" type="email" placeholder="siswa@example.com"
                value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Kode Kelas</label>
              <select className="neo-input" value={form.classCode} onChange={e => update('classCode', e.target.value)} required>
                <option value="">-- Pilih Kelas --</option>
                {['A','B','C','D','E','F','G','H','I','J'].map(l => (
                  <option key={l} value={`XI-${l}`}>XI-{l}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="neo-input" type={show ? 'text' : 'password'} placeholder="Min. 8 karakter"
                  value={form.password} onChange={e => update('password', e.target.value)} required
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShow(!show)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
                }}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="neo-btn neo-btn-primary"
              disabled={loading || success}
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '0.95rem', marginTop: 8 }}>
              {loading ? 'Mendaftarkan...' : <><UserPlus size={16} /> DAFTAR</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, borderTop: '2px dashed #e0e0e0', paddingTop: 20 }}>
            <Link to="/login" style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
