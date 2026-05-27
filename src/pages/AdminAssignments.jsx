import { useState, useEffect } from 'react'
import { ClipboardList, Plus, Globe, Trash2, Eye, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getClasses, getSubmissions } from '../lib/api'
import { Loader, StatusBadge, Alert, Modal, EmptyState } from '../components/UI'

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const EMPTY_QUESTION = { 
  type: 'multiple_choice', 
  orderNumber: 1, 
  content: '', 
  choices: [
    { key: 'A', text: '' }, 
    { key: 'B', text: '' }, 
    { key: 'C', text: '' }, 
    { key: 'D', text: '' }
  ], 
  correctKey: 'A', 
  points: 5 
}

const EMPTY_ESSAY = { type: 'essay', orderNumber: 1, content: '', points: 10 }

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [recapModal, setRecapModal] = useState(null)
  const [recap, setRecap] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const [form, setForm] = useState({
    title: '', 
    classRoomIds: [], 
    startAt: '', 
    endAt: '',
    duration: 60, 
    passingScore: 70, 
    shuffleQuestions: true, 
    showResult: true,
    questions: [{ ...EMPTY_QUESTION }],
  })

  useEffect(() => {
    load()
    getClasses().then(r => setClasses(r.data || [])).catch(console.error)
  }, [])

  function load() {
    setLoading(true)
    getAssignments()
      .then(r => setAssignments(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  function updateForm(k, v) { 
    setForm(p => ({ ...p, [k]: v })) 
  }

  function addQuestion(type) {
    const q = type === 'essay' ? { ...EMPTY_ESSAY } : { ...EMPTY_QUESTION }
    q.orderNumber = form.questions.length + 1
    setForm(p => ({ 
      ...p, 
      questions: [...p.questions, { ...q }] 
    }))
  }

  function updateQuestion(i, k, v) {
    setForm(p => {
      const qs = [...p.questions]
      qs[i] = { ...qs[i], [k]: v }
      return { ...p, questions: qs }
    })
  }

  function updateChoice(qi, ci, v) {
    setForm(p => {
      const qs = [...p.questions]
      const choices = [...qs[qi].choices]
      choices[ci] = { ...choices[ci], text: v }
      qs[qi] = { ...qs[qi], choices }
      return { ...p, questions: qs }
    })
  }

  function removeQuestion(i) {
    setForm(p => ({ 
      ...p, 
      questions: p.questions.filter((_, idx) => idx !== i) 
    }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createAssignment({
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        duration: Number(form.duration),
        passingScore: Number(form.passingScore),
      })
      setSuccess('Ujian berhasil dibuat!')
      setShowCreate(false)
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(id) {
    try {
      await updateAssignment(id, { status: 'published' })
      setSuccess('Ujian dipublish!')
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus ujian ini?')) return
    try {
      await deleteAssignment(id)
      setSuccess('Ujian dihapus')
      load()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  async function openRecap(a) {
    setRecapModal(a)
    setRecap(null)
    try {
      const r = await getSubmissions(a._id)
      setRecap(r.data)
    } catch (e) {
      setRecap({ error: e.message })
    }
  }

  const filtered = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title"><ClipboardList size={24} /> Manajemen Ujian</h2>
        <button className="neo-btn neo-btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Buat Ujian
        </button>
      </div>
      <div className="accent-strip" />

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 320 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          className="neo-input" 
          placeholder="Cari ujian..." 
          value={search}
          onChange={e => setSearch(e.target.value)} 
          style={{ paddingLeft: 40 }} 
        />
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? <EmptyState icon={ClipboardList} message="Belum ada ujian" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => (
            <div key={a._id} className="neo-card">
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>{a.title}</h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {a.classRooms?.map(c => c.name).join(', ')} • {a.duration} menit • {a.totalPoints} poin
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {a.status === 'draft' && (
                    <button className="neo-btn neo-btn-green" onClick={() => handlePublish(a._id)} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                      <Globe size={15} /> Publish
                    </button>
                  )}
                  <button className="neo-btn neo-btn-ghost" onClick={() => openRecap(a)} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                    <Eye size={15} /> Rekap
                  </button>
                  <button className="neo-btn neo-btn-ghost" onClick={() => setExpanded(expanded === a._id ? null : a._id)} style={{ padding: '8px 10px', fontSize: '0.8rem' }}>
                    {expanded === a._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === a._id && (
                <div className="expanded-info">
                  <span>📅 Mulai: {formatDate(a.startAt)}</span>
                  <span>🏁 Berakhir: {formatDate(a.endAt)}</span>
                  <span>🎯 KKM: {a.passingScore}%</span>
                  <span>🔀 Acak: {a.shuffleQuestions ? 'Ya' : 'Tidak'}</span>
                  <span>👁 Hasil: {a.showResult ? 'Ya' : 'Tidak'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ==================== CREATE MODAL ==================== */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Buat Ujian Baru">
        <form onSubmit={handleCreate} className="create-form">
          {error && <Alert type="error">{error}</Alert>}

          <div className="form-group">
            <label className="form-label">Judul Ujian</label>
            <input className="neo-input" value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="UTS Matematika Semester 1" required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Durasi (menit)</label>
              <input className="neo-input" type="number" value={form.duration} onChange={e => updateForm('duration', e.target.value)} min={5} required />
            </div>
            <div className="form-group">
              <label className="form-label">KKM (%)</label>
              <input className="neo-input" type="number" value={form.passingScore} onChange={e => updateForm('passingScore', e.target.value)} min={0} max={100} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Mulai</label>
              <input className="neo-input" type="datetime-local" value={form.startAt} onChange={e => updateForm('startAt', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Selesai</label>
              <input className="neo-input" type="datetime-local" value={form.endAt} onChange={e => updateForm('endAt', e.target.value)} required />
            </div>
          </div>

          {/* Kelas */}
          <div className="form-group">
            <label className="form-label">Kelas</label>
            <div className="class-selection">
              {classes.map(c => (
                <label key={c._id} className="class-label">
                  <input 
                    type="checkbox"
                    checked={form.classRoomIds.includes(c._id)}
                    onChange={e => {
                      updateForm('classRoomIds', e.target.checked
                        ? [...form.classRoomIds, c._id]
                        : form.classRoomIds.filter(x => x !== c._id))
                    }} 
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* Questions Section */}
          <div className="questions-section">
            <div className="questions-header">
              <p className="questions-title">Soal ({form.questions.length})</p>
              <div className="add-buttons">
                <button type="button" className="neo-btn neo-btn-dark" onClick={() => addQuestion('multiple_choice')}>
                  + Pilihan Ganda
                </button>
                <button type="button" className="neo-btn neo-btn-ghost" onClick={() => addQuestion('essay')}>
                  + Essay
                </button>
              </div>
            </div>

            <div className="questions-list">
              {form.questions.map((q, i) => (
                <div key={i} className="question-card">
                  <div className="question-header">
                    <span className="question-type">
                      {i + 1}. {q.type === 'essay' ? 'Essay' : 'Pilihan Ganda'}
                    </span>
                    <button type="button" className="remove-btn" onClick={() => removeQuestion(i)}>
                      <X size={18} />
                    </button>
                  </div>

                  <textarea 
                    className="neo-input question-textarea" 
                    rows={3} 
                    placeholder="Tulis pertanyaan di sini..." 
                    value={q.content}
                    onChange={e => updateQuestion(i, 'content', e.target.value)} 
                    required 
                  />

                  <div className="points-row">
                    <label>Poin:</label>
                    <input 
                      className="neo-input" 
                      type="number" 
                      value={q.points} 
                      min={1}
                      onChange={e => updateQuestion(i, 'points', Number(e.target.value))}
                      style={{ width: 80 }}
                    />
                  </div>

                  {q.type === 'multiple_choice' && (
                    <>
                      {q.choices.map((c, ci) => (
                        <div key={c.key} className="choice-row">
                          <span className="choice-key">{c.key}</span>
                          <input 
                            className="neo-input" 
                            placeholder={`Pilihan ${c.key}`} 
                            value={c.text}
                            onChange={e => updateChoice(i, ci, e.target.value)} 
                          />
                        </div>
                      ))}
                      <div className="correct-answer">
                        <label>Jawaban Benar:</label>
                        <select 
                          className="neo-input" 
                          value={q.correctKey} 
                          onChange={e => updateQuestion(i, 'correctKey', e.target.value)}
                          style={{ width: 100 }}
                        >
                          {q.choices.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="neo-btn neo-btn-primary submit-btn" disabled={saving}>
            {saving ? 'Menyimpan...' : <><Plus size={18} /> Buat Ujian</>}
          </button>
        </form>
      </Modal>

      {/* ==================== REKAP MODAL ==================== */}
      <Modal open={!!recapModal} onClose={() => { setRecapModal(null); setRecap(null) }} title={`Rekap: ${recapModal?.title || ''}`}>
        {!recap ? <Loader /> : recap.error ? <Alert type="error">{recap.error}</Alert> : (
          <div>
            <div className="stats-grid">
              {[
                { label: 'Total Submission', value: recap.summary?.totalSubmissions ?? 0 },
                { label: 'Rata-rata', value: `${recap.summary?.averageScore ?? 0}%` },
                { label: 'Lulus', value: `${recap.summary?.passRate ?? 0}%` },
              ].map(({ label, value }, idx) => (
                <div key={idx} className="stat-card">
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            <div className="submissions-list">
              {(recap.submissions || []).map(s => (
                <div key={s.submissionId} className="submission-item">
                  <div>
                    <div className="student-name">{s.student?.fullName}</div>
                    <div className="student-class">{s.student?.classRoom?.name}</div>
                  </div>
                  <div className="score-section">
                    <span className="percent-score">{s.percentScore}%</span>
                    <span className={`status-badge ${s.isPassed ? 'pass' : 'fail'}`}>
                      {s.isPassed ? '✓ LULUS' : '✗ GAGAL'}
                    </span>
                  </div>
                </div>
              ))}
              {(recap.submissions || []).length === 0 && (
                <p className="no-submission">Belum ada siswa yang mengerjakan</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
