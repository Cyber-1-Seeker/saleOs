import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

const authStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg)',
}

const boxStyle: React.CSSProperties = {
  width: 380,
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  padding: '40px 36px',
  boxShadow: 'var(--shadow-lg)',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Неверный email или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={authStyle}>
      <div style={boxStyle}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: 'var(--accent)', marginBottom: 4 }}>
            ⚡ SalesOS
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Войдите в систему</div>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 14, background: 'rgba(184,85,85,0.08)', padding: '8px 12px', borderRadius: 8 }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text2)' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  )
}
