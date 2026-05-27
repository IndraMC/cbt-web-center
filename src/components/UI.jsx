import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export function Loader() {
  return (
    <div className="loader">
      <div className="loader-dot" />
      <div className="loader-dot" />
      <div className="loader-dot" />
    </div>
  )
}

export function Alert({ type = 'info', children }) {
  const map = {
    error:   { cls: 'alert-error',   Icon: AlertCircle },
    success: { cls: 'alert-success', Icon: CheckCircle },
    info:    { cls: 'alert-info',    Icon: Info },
    warn:    { cls: 'alert-warn',    Icon: AlertTriangle },
  }
  const { cls, Icon } = map[type] || map.info
  return (
    <div className={`neo-alert ${cls}`}>
      <Icon size={16} /> {children}
    </div>
  )
}

export function Badge({ color = 'gray', children }) {
  return <span className={`neo-badge badge-${color}`}>{children}</span>
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header" style={{
            borderBottom: '2px dashed #e0e0e0', paddingBottom: 12, marginBottom: 16,
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem',
            }}>{title}</h2>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-muted)',
              flexShrink: 0, marginLeft: 8, lineHeight: 1,
            }}>✕</button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={48} />}
      <p style={{ fontWeight: 700 }}>{message}</p>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    published:   { color: 'green',  label: 'Published' },
    draft:       { color: 'gray',   label: 'Draft' },
    submitted:   { color: 'blue',   label: 'Submitted' },
    not_started: { color: 'yellow', label: 'Belum Mulai' },
    in_progress: { color: 'orange', label: 'Sedang Berjalan' },
    graded:      { color: 'green',  label: 'Dinilai' },
  }
  const { color, label } = map[status] || { color: 'gray', label: status }
  return <Badge color={color}>{label}</Badge>
}

export function ScoreChip({ score, passing }) {
  const passed = score >= passing
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: '0.85rem',
      padding: '4px 10px',
      border: '2px solid var(--border)',
      borderRadius: 2,
      background: passed ? 'var(--accent-green)' : '#ffcccc',
      color: 'var(--text)',
    }}>
      {score}% {passed ? '✓' : '✗'}
    </span>
  )
}
