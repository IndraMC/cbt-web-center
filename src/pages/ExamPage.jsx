import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Send, AlertTriangle, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { startExam, submitExam } from '../lib/api'
import { Loader, Alert, Modal } from '../components/UI'

function formatTime(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ExamPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [examData, setExamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    startExam(id)
      .then(r => {
        setExamData(r.data)
        setTimeLeft(r.data.submission.timeRemaining)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!examData || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [examData])

  const handleSubmit = useCallback(async (auto = false) => {
    if (!examData) return
    setSubmitting(true)
    setShowConfirm(false)
    try {
      const { questions, submission } = examData
      const answerList = questions.map(q => {
        const ans = answers[q.questionId]
        if (q.type === 'multiple_choice') {
          return { questionId: q.questionId, selectedKey: ans || '' }
        }
        return { questionId: q.questionId, essayText: ans || '' }
      })
      const res = await submitExam(id, submission.submissionId, answerList)
      clearInterval(timerRef.current)
      setResult(res.data)
    } catch (e) {
      setError(e.message)
      setSubmitting(false)
    }
  }, [examData, answers, id])

  if (loading) return <Loader />
  if (error && !examData) return (
    <div style={{ padding: 32 }}>
      <Alert type="error">{error}</Alert>
      <button className="neo-btn neo-btn-ghost" onClick={() => navigate('/tasks')} style={{ marginTop: 12 }}>
        <ChevronLeft size={16} /> Kembali
      </button>
    </div>
  )

  // Result screen
  if (result) {
    return (
      <div className="fade-up" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <div className="neo-card" style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Hasil Ujian
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div className={`score-circle ${result.isPassed ? 'score-pass' : 'score-fail'}`}>
              <span style={{ fontSize: '2rem' }}>{result.percentScore}%</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{result.isPassed ? '✓ LULUS' : '✗ GAGAL'}</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', border: '2px solid var(--border)', borderRadius: 4, padding: '16px 24px', marginBottom: 24, display: 'inline-block' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Skor</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem' }}>
              {result.rawScore} / {result.totalPoints}
            </p>
          </div>

          {result.breakdown && (
            <div style={{ textAlign: 'left', marginBottom: 24 }}>
              <p style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, color: 'var(--text-muted)' }}>Detail Soal</p>
              {result.breakdown.map((b, i) => (
                <div key={b.questionId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', border: '2px solid var(--border)', borderRadius: 4, marginBottom: 6,
                  background: b.type === 'essay' ? '#f5f5f5' : b.isCorrect ? '#e0ffe8' : '#ffe0e0',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Soal {i + 1} ({b.type === 'multiple_choice' ? 'PG' : 'Essay'})</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem' }}>
                    {b.type === 'multiple_choice' ? (b.isCorrect ? '✓ Benar' : '✗ Salah') : `+${b.pointsEarned} poin`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button className="neo-btn neo-btn-dark" onClick={() => navigate('/dashboard')} style={{ width: '100%', justifyContent: 'center' }}>
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { assignment, questions } = examData
  const q = questions[currentQ]
  const answered = Object.keys(answers).length
  const totalQ = questions.length
  const pct = (timeLeft / (assignment.duration * 60)) * 100

  const timerClass = pct < 10 ? 'timer-danger' : pct < 25 ? 'timer-warning' : 'timer-bar'

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div className="neo-card" style={{ padding: '14px 20px', marginBottom: 16, background: 'var(--border)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>{assignment.title}</p>
            <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: 2 }}>{answered}/{totalQ} soal dijawab</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: pct < 10 ? '#ff2222' : pct < 25 ? 'var(--accent-orange)' : 'var(--accent-green)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 4, padding: '8px 16px',
          }}>
            <Clock size={18} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.2rem', color: pct < 10 ? '#fff' : 'var(--text)' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        {/* Progress */}
        <div className="neo-progress" style={{ marginTop: 12 }}>
          <div className={`neo-progress-bar ${timerClass}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Question navigator */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {questions.map((qq, i) => (
          <button key={qq.questionId} onClick={() => setCurrentQ(i)} style={{
            width: 36, height: 36, border: '2px solid var(--border)', borderRadius: 4,
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem',
            cursor: 'pointer',
            background: i === currentQ ? 'var(--border)' : answers[qq.questionId] ? 'var(--accent-green)' : '#fff',
            color: i === currentQ ? '#fff' : 'var(--text)',
            transition: 'all 0.12s',
          }}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="neo-card question-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{
            background: 'var(--accent-yellow)', border: '2px solid var(--border)',
            borderRadius: 4, padding: '4px 10px', fontWeight: 800, fontSize: '0.82rem',
          }}>
            Soal {currentQ + 1}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'} · {q.points} poin
          </span>
        </div>

        <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, lineHeight: 1.6 }}>
          {q.content}
        </p>

        {q.type === 'multiple_choice' ? (
          <div>
            {q.choices.map(choice => (
              <button
                key={choice.key}
                className={`choice-btn ${answers[q.questionId] === choice.key ? 'selected' : ''}`}
                onClick={() => setAnswers(a => ({ ...a, [q.questionId]: choice.key }))}
              >
                <span className="choice-key">{choice.key}</span>
                {choice.text}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            className="neo-input"
            rows={5}
            placeholder="Tuliskan jawaban kamu di sini..."
            value={answers[q.questionId] || ''}
            onChange={e => setAnswers(a => ({ ...a, [q.questionId]: e.target.value }))}
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}
          />
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
        <button className="neo-btn neo-btn-ghost"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(q => q - 1)}
          style={{ opacity: currentQ === 0 ? 0.4 : 1 }}>
          <ChevronLeft size={16} /> Sebelumnya
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          {currentQ < totalQ - 1 ? (
            <button className="neo-btn neo-btn-dark" onClick={() => setCurrentQ(q => q + 1)}>
              Selanjutnya <ChevronRight size={16} />
            </button>
          ) : (
            <button className="neo-btn neo-btn-primary" onClick={() => setShowConfirm(true)}>
              <CheckSquare size={16} /> Kumpulkan Jawaban
            </button>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Konfirmasi Submit">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: '#fff8e0', border: '2px solid #cc8800', borderRadius: 4, marginBottom: 20 }}>
          <AlertTriangle size={20} color="#cc8800" />
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#cc8800' }}>
            {answered < totalQ
              ? `Masih ada ${totalQ - answered} soal yang belum dijawab!`
              : 'Semua soal sudah dijawab.'}
          </p>
        </div>
        <p style={{ fontSize: '0.88rem', marginBottom: 20, color: 'var(--text-muted)', fontWeight: 700 }}>
          Setelah dikumpulkan, jawaban tidak bisa diubah lagi.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="neo-btn neo-btn-ghost" onClick={() => setShowConfirm(false)} style={{ flex: 1, justifyContent: 'center' }}>
            Batal
          </button>
          <button className="neo-btn neo-btn-primary" onClick={() => handleSubmit(false)}
            disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
            {submitting ? 'Mengumpulkan...' : <><Send size={16} /> Ya, Kumpulkan</>}
          </button>
        </div>
      </Modal>
    </div>
  )
}
