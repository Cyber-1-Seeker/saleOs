import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', password2: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Пароли не совпадают'); return }
    setError(''); setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err: any) {
      const d = err?.response?.data
      setError(d?.email?.[0] || d?.username?.[0] || d?.password?.[0] || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 400, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px 36px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: 'var(--accent)', marginBottom: 4 }}>⚡ SalesOS</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Создать аккаунт</div>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Имя пользователя</label>
            <input className="form-input" placeholder="username" value={form.username} onChange={set('username')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input className="form-input" type="password" placeholder="минимум 6 символов" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">Повторите пароль</label>
            <input className="form-input" type="password" placeholder="••••••" value={form.password2} onChange={set('password2')} required />
          </div>
          {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 14, background: 'rgba(184,85,85,0.08)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Создаём...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text2)' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Войти</Link>
        </div>
      </div>
    </div>
  )
}
