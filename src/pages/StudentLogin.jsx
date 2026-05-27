import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn, Eye, EyeOff, BookOpen, UserPlus } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { studentLogin } from '../lib/api'
import { Alert } from '../components/UI'

export default function StudentLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginStudent } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await studentLogin(email, password)
      loginStudent(res.token, res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card fade-up">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64,
            background: 'var(--accent-yellow)',
            border: '3px solid var(--border)',
            boxShadow: 'var(--shadow)',
            borderRadius: 4,
            marginBottom: 16,
          }}>
            <BookOpen size={32} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
            CBT SISWA
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6, fontWeight: 700 }}>
            COMPUTER BASED TEST SYSTEM
          </p>
          <div style={{ height: 4, background: 'var(--accent-yellow)', border: '2px solid var(--border)', borderRadius: 2, marginTop: 12 }} />
        </div>

        <div className="neo-card" style={{ padding: 28 }}>
          {error && <Alert type="error">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="neo-input"
                type="email"
                placeholder="siswa@sekolah.sch.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="neo-input"
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShow(!show)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex',
                }}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="neo-btn neo-btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '14px 20px', fontSize: '0.95rem' }}
            >
              {loading ? 'Masuk...' : <><LogIn size={16} /> MASUK</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, borderTop: '2px dashed #e0e0e0', paddingTop: 20 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Belum punya akun? </span>
            <Link to="/register" style={{
              color: 'var(--text)',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <UserPlus size={14} /> Daftar
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#aaa', marginTop: 16, fontWeight: 700 }}>
          CBT SYSTEM © 2025 — ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  )
}
