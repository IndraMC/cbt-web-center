import { useState, useEffect } from 'react'
import { ClipboardList, Plus, Globe, Eye, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getClasses, getSubmissions } from '../lib/api'
import { Loader, StatusBadge, Alert, Modal, EmptyState } from '../components/UI'

function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const EMPTY_QUESTION = { type: 'multiple_choice', orderNumber: 1, content: '', choices: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }], correctKey: 'A', points: 5 }
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
    title: '', classRoomIds: [], startAt: '', endAt: '',
    duration: 60, passingScore: 70, shuffleQuestions: true, showResult: true,
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

  function updateForm(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function addQuestion(type) {
    const q = type === 'essay' ? { ...EMPTY_ESSAY } : { ...EMPTY_QUESTION }
    q.orderNumber = form.questions.length + 1
    setForm(p => ({ ...p, questions: [...p.questions, { ...q }] }))
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
    setForm(p => ({ ...p, questions: p.questions.filter((_, idx) => idx !== i) }))
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
      setForm({
        title: '', classRoomIds: [], startAt: '', endAt: '',
        duration: 60, passingScore: 70, shuffleQuestions: true, showResult: true,
        questions: [{ ...EMPTY_QUESTION }],
      })
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
      <div style={{ position: 'relative', marginBottom: 16, maxWidth: 300 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="neo-input" placeholder="Cari ujian..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? <EmptyState icon={ClipboardList} message="Belum ada ujian" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(a => (
            <div key={a._id} className="neo-card">
              {/* Card Header */}
              <div style={{ padding: '14px 16px' }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', wordBreak: 'break-word' }}>{a.title}</h3>
                      <StatusBadge status={a.status} />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1.6 }}>
                      {a.classRooms?.map(c => c.name).join(', ')} · {a.duration} menit · {a.totalPoints} poin · s/d {formatDate(a.endAt)}
                    </p>
                  </div>
                </div>
                {/* Buttons row */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {a.status === 'draft' && (
                    <button className="neo-btn neo-btn-green" onClick={() => handlePublish(a._id)} style={{ padding: '6px 10px', fontSize: '0.72rem' }}>
                      <Globe size={13} /> Publish
                    </button>
                  )}
                  <button className="neo-btn neo-btn-ghost" onClick={() => openRecap(a)} style={{ padding: '6px 10px', fontSize: '0.72rem' }}>
                    <Eye size={13} /> Rekap
                  </button>
                  <button className="neo-btn neo-btn-ghost" onClick={() => setExpanded(expanded === a._id ? null : a._id)} style={{ padding: '6px 8px', fontSize: '0.72rem', marginLeft: 'auto' }}>
                    {expanded === a._id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === a._id && (
                <div style={{ borderTop: '2px dashed #e0e0e0', padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', lineHeight: 2 }}>
                    <span>📅 Mulai: {formatDate(a.startAt)}</span>
                    <span>🏁 Berakhir: {formatDate(a.endAt)}</span>
                    <span>🎯 KKM: {a.passingScore}%</span>
                    <span>🔀 Acak: {a.shuffleQuestions ? 'Ya' : 'Tidak'}</span>
                    <span>👁 Tampil Hasil: {a.showResult ? 'Ya' : 'Tidak'}</span>
                    <span>🔄 Max Attempt: {a.maxAttempts}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--card)',
            border: '3px solid var(--border)',
            boxShadow: '8px 8px 0 var(--border)',
            borderRadius: 'var(--radius)',
            padding: 'clamp(14px, 4vw, 24px)',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeUp 0.25s ease',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '2px dashed #e0e0e0', flexShrink: 0 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>Buat Ujian Baru</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              {error && <Alert type="error">{error}</Alert>}
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Judul Ujian</label>
                  <input className="neo-input" value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="UTS Matematika..." required />
                </div>

                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Durasi (menit)</label>
                    <input className="neo-input" type="number" value={form.duration} onChange={e => updateForm('duration', e.target.value)} min={5} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">KKM (%)</label>
                    <input className="neo-input" type="number" value={form.passingScore} onChange={e => updateForm('passingScore', e.target.value)} min={0} max={100} required />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mulai</label>
                    <input className="neo-input" type="datetime-local" value={form.startAt} onChange={e => updateForm('startAt', e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Selesai</label>
                    <input className="neo-input" type="datetime-local" value={form.endAt} onChange={e => updateForm('endAt', e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Kelas</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, border: '2px solid var(--border)', borderRadius: 4, padding: 10 }}>
                    {classes.map(c => (
                      <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', border: '2px solid var(--border)', borderRadius: 4, background: form.classRoomIds.includes(c._id) ? 'var(--accent-yellow)' : 'var(--bg)' }}>
                        <input type="checkbox"
                          style={{ display: 'none' }}
                          checked={form.classRoomIds.includes(c._id)}
                          onChange={e => {
                            updateForm('classRoomIds', e.target.checked
                              ? [...form.classRoomIds, c._id]
                              : form.classRoomIds.filter(x => x !== c._id))
                          }} />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Soal ({form.questions.length})</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button type="button" className="neo-btn neo-btn-dark" onClick={() => addQuestion('multiple_choice')} style={{ padding: '5px 8px', fontSize: '0.7rem' }}>
                        + Pilihan Ganda
                      </button>
                      <button type="button" className="neo-btn neo-btn-ghost" onClick={() => addQuestion('essay')} style={{ padding: '5px 8px', fontSize: '0.7rem' }}>
                        + Essay
                      </button>
                    </div>
                  </div>
                  {form.questions.map((q, i) => (
                    <div key={i} style={{ border: '2px solid var(--border)', borderRadius: 4, padding: 12, marginBottom: 10, background: 'var(--bg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.75rem', background: q.type === 'essay' ? '#e0e0e0' : 'var(--accent-yellow)', border: '2px solid var(--border)', borderRadius: 2, padding: '3px 8px' }}>
                          {i + 1}. {q.type === 'essay' ? 'Essay' : 'Pilihan Ganda'}
                        </span>
                        <button type="button" onClick={() => removeQuestion(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cc0000' }}>
                          <X size={16} />
                        </button>
                      </div>
                      <textarea className="neo-input" rows={2} placeholder="Pertanyaan..." value={q.content}
                        onChange={e => updateQuestion(i, 'content', e.target.value)} required
                        style={{ marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Poin:</label>
                        <input className="neo-input" type="number" value={q.points} min={1}
                          onChange={e => updateQuestion(i, 'points', Number(e.target.value))}
                          style={{ width: 70 }} />
                      </div>
                      {q.type === 'multiple_choice' && (
                        <>
                          {q.choices.map((c, ci) => (
                            <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ width: 24, height: 24, border: '2px solid var(--border)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0, background: 'var(--card)' }}>{c.key}</span>
                              <input className="neo-input" placeholder={`Pilihan ${c.key}`} value={c.text}
                                onChange={e => updateChoice(i, ci, e.target.value)} />
                            </div>
                          ))}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Jawaban Benar:</label>
                            <select className="neo-input" value={q.correctKey} onChange={e => updateQuestion(i, 'correctKey', e.target.value)} style={{ width: 80 }}>
                              {q.choices.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" className="neo-btn neo-btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }}>
                  {saving ? 'Menyimpan...' : <><Plus size={16} /> Buat Ujian</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recap Modal */}
      <Modal open={!!recapModal} onClose={() => { setRecapModal(null); setRecap(null) }} title={`Rekap: ${recapModal?.title || ''}`}>
        {!recap ? <Loader /> : recap.error ? <Alert type="error">{recap.error}</Alert> : (
          <div>
            <div className="grid-3 recap-summary" style={{ marginBottom: 16 }}>
              {[
                { label: 'Submission', value: recap.summary?.totalSubmissions ?? 0 },
                { label: 'Rata-rata', value: `${recap.summary?.averageScore ?? 0}%` },
                { label: 'Lulus', value: `${recap.summary?.passRate ?? 0}%` },
              ].map(({ label, value }) => (
                <div key={label} className="neo-card" style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>{value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', overflowX: 'auto' }}>
              <table className="neo-table striped" style={{ minWidth: 320 }}>
                <thead>
                  <tr><th>Siswa</th><th>Kelas</th><th>Nilai</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(recap.submissions || []).map(s => (
                    <tr key={s.submissionId}>
                      <td style={{ fontWeight: 700 }}>{s.student?.fullName}</td>
                      <td style={{ fontSize: '0.78rem' }}>{s.student?.classRoom?.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{s.percentScore}%</td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                          border: '2px solid var(--border)', borderRadius: 2,
                          background: s.isPassed ? 'var(--accent-green)' : '#ffcccc',
                        }}>
                          {s.isPassed ? '✓ LULUS' : '✗ GAGAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
