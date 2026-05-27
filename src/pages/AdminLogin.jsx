import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { adminLogin } from '../lib/api'
import { Alert } from '../components/UI'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminLogin(email, password)
      loginAdmin(res.token, res.data)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card fade-up">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64,
            background: 'var(--border)',
            border: '3px solid var(--border)',
            boxShadow: 'var(--shadow)',
            borderRadius: 4,
            marginBottom: 16,
          }}>
            <ShieldCheck size={32} color="#FFE500" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
            ADMIN PANEL
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4, fontWeight: 700 }}>
            AKSES TERBATAS — HANYA ADMIN
          </p>
          <div style={{ height: 4, background: 'var(--border)', border: '2px solid var(--border)', borderRadius: 2, marginTop: 10 }} />
        </div>

        <div className="neo-card" style={{ padding: 28, borderColor: 'var(--border)', borderWidth: 3 }}>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Admin</label>
              <input className="neo-input" type="email" placeholder="admin@cbt.sch.id"
                value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="neo-input" type={show ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShow(!show)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex',
                }}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="neo-btn neo-btn-dark"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '0.95rem', marginTop: 8 }}>
              {loading ? 'Memverifikasi...' : <><LogIn size={16} /> MASUK SEBAGAI ADMIN</>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#aaa', marginTop: 16, fontWeight: 700 }}>
          ⚠️ HALAMAN INI TIDAK DIPUBLIKASIKAN
        </p>
      </div>
    </div>
  )
}
