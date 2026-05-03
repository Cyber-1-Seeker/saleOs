import { useEffect } from 'react'

// ── MODAL ──
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  width?: number
}

export function Modal({ open, onClose, title, subtitle, icon, footer, children, width = 640 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, open])

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal" style={{ width }}>
        <div className="modal-head">
          {icon && <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{icon}</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && <div className="modal-title">{title}</div>}
            {subtitle && (
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0, width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text3)', fontSize: 16, borderRadius: 6,
              transition: 'all 0.15s', border: 'none', background: 'none', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget.style.background = 'var(--bg3)'); (e.currentTarget.style.color = 'var(--text)') }}
            onMouseLeave={(e) => { (e.currentTarget.style.background = ''); (e.currentTarget.style.color = 'var(--text3)') }}
          >✕</button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="form-input" {...props} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="form-input" {...props} />
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
}
export function Select({ options, ...rest }: SelectProps) {
  return (
    <select className="form-input" {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid var(--border2)',
      borderTop: '2px solid var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

export function Empty({ icon = '◌', text = 'Пусто' }: { icon?: string; text?: string }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-text">{text}</div>
    </div>
  )
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  const palettes = [
    { bg: 'rgba(184,115,51,0.15)', color: 'var(--accent)' },
    { bg: 'rgba(74,110,168,0.15)', color: 'var(--info)' },
    { bg: 'rgba(74,140,106,0.15)', color: 'var(--success)' },
    { bg: 'rgba(184,136,42,0.15)', color: 'var(--warning)' },
    { bg: 'rgba(140,74,168,0.15)', color: '#9B6FE0' },
  ]
  const p = palettes[(name.charCodeAt(0) || 0) % palettes.length]
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: p.bg, color: p.color, fontSize: Math.round(size * 0.33) }}
    >
      {initials}
    </div>
  )
}

if (!document.getElementById('__salesos_styles')) {
  const s = document.createElement('style')
  s.id = '__salesos_styles'
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }'
  document.head.appendChild(s)
}
