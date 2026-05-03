import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'

const NAV = [
  { to: '/',          icon: '◈',  label: 'Дашборд',   exact: true },
  { to: '/clients',   icon: '◉',  label: 'Клиенты',   badge: true },
  { to: '/pipeline',  icon: '⇌',  label: 'Воронка' },
  { to: '/templates', icon: '▤',  label: 'Шаблоны' },
  { to: '/catalog',   icon: '⊞',  label: 'Каталог' },
  { to: '/reminders', icon: '◷',  label: 'Follow-up', badge: true },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useThemeStore()
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const [titles] = useState<Record<string, string>>({
    '/': 'Дашборд',
    '/clients': 'Клиенты',
    '/pipeline': 'Воронка продаж',
    '/templates': 'Шаблоны ответов',
    '/catalog': 'Каталог',
    '/reminders': 'Follow-up',
  })

  const currentTitle = titles[window.location.pathname] ?? 'SalesOS'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app">
      {/* ── SIDEBAR ── */}
      <nav className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-mark">⚡</span>
          <span className="logo-text">SalesOS</span>
        </div>

        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge" />}
          </NavLink>
        ))}

        <div className="sidebar-spacer" />

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Сменить тему"
          >
            <span className="nav-icon">{theme === 'dark' ? '☼' : '☽'}</span>
            <span className="nav-label">{theme === 'dark' ? 'Светлая' : 'Тёмная'}</span>
          </button>

          <button className="nav-item" onClick={handleLogout} title="Выйти">
            <span className="nav-icon">⇤</span>
            <span className="nav-label">Выйти</span>
          </button>

          <button
            className="nav-item"
            onClick={() => setOpen((p) => !p)}
            title={open ? 'Свернуть' : 'Развернуть'}
          >
            <span className="nav-icon">{open ? '‹' : '›'}</span>
            <span className="nav-label">Свернуть</span>
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div className="main">
        <header className="topbar">
          <PageTitle />
          <div className="topbar-actions">
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {user?.first_name || user?.username || user?.email}
            </span>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function PageTitle() {
  const path = window.location.pathname
  const map: Record<string, string> = {
    '/': 'Дашборд',
    '/clients': 'Клиенты',
    '/pipeline': 'Воронка продаж',
    '/templates': 'Шаблоны ответов',
    '/catalog': 'Каталог',
    '/reminders': 'Follow-up',
  }
  return <span className="topbar-title">{map[path] ?? 'SalesOS'}</span>
}
