import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientsApi, remindersApi } from '@/api'
import { Avatar } from '@/components/ui'
import dayjs from 'dayjs'

const STATUS_BADGE: Record<string, string> = {
  new: 'badge-new', hot: 'badge-hot', active: 'badge-active',
  cold: 'badge-cold', paid: 'badge-paid', lost: 'badge-lost',
}
const STATUS_LABEL: Record<string, string> = {
  new: 'Новый', hot: 'Горячий', active: 'В работе',
  cold: 'Холодный', paid: 'Оплатил', lost: 'Слился',
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [rStats, setRStats] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    clientsApi.stats().then((r) => setStats(r.data))
    clientsApi.list({ status: 'hot' }).then((r) => setClients(r.data.results ?? r.data))
    remindersApi.list({ filter: 'today' }).then((r) => setReminders((r.data.results ?? r.data).slice(0, 5)))
    remindersApi.stats().then((r) => setRStats(r.data))
  }, [])

  return (
    <div className="page-enter">
      {/* ── STATS ── */}
      <div className="stats-row">
        <StatCard label="Новые лиды" value={stats?.new ?? '—'} color="var(--info)" delta="+4 сегодня" up />
        <StatCard label="В работе" value={stats?.active ?? '—'} color="var(--accent)" delta="+7 неделя" up />
        <StatCard label="Оплатили" value={stats?.paid ?? '—'} color="var(--success)" />
        <StatCard label="Слились" value={stats?.lost ?? '—'} color="var(--danger)" />
      </div>

      {/* ── TWO COL ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Clients needing attention */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">Требуют внимания</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clients')}>Все клиенты →</button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {clients.length === 0 && (
              <div style={{ padding: '28px 22px', color: 'var(--text3)', fontSize: 13 }}>
                Нет горячих клиентов
              </div>
            )}
            {clients.slice(0, 6).map((c) => (
              <div
                key={c.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 22px', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                onClick={() => navigate('/clients')}
              >
                <Avatar name={c.name} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.nickname && `${c.nickname} · `}{c.interest}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>
                  {dayjs(c.updated_at).fromNow?.() ?? dayjs(c.updated_at).format('DD.MM')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">Follow-up сегодня</span>
            {rStats?.overdue > 0 && (
              <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700 }}>
                {rStats.overdue} просрочено
              </span>
            )}
          </div>
          <div style={{ padding: '8px 6px' }}>
            {reminders.length === 0 && (
              <div style={{ padding: '28px 16px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>
                Напоминаний нет
              </div>
            )}
            {reminders.map((r) => (
              <div key={r.id} className="reminder-item" onClick={() => navigate('/reminders')}>
                <div className="r-dot" style={{ background: r.is_overdue ? 'var(--danger)' : r.priority === 'high' ? 'var(--accent)' : 'var(--info)' }} />
                <div style={{ flex: 1 }}>
                  <div className="r-title">{r.title}</div>
                  <div className="r-sub">{r.client_name && `${r.client_name} · `}{dayjs(r.due_date).format('HH:mm')}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: '10px 12px 4px' }}>
              <button className="btn btn-ghost btn-sm w-full" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/reminders')}>
                Все напоминания →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK PIPELINE ── */}
      <div className="card mt-16">
        <div className="card-head">
          <span className="card-title">Воронка (обзор)</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/pipeline')}>Открыть →</button>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Новый лид', color: 'var(--info)', n: stats?.new ?? 0 },
              { label: 'В работе', color: 'var(--accent)', n: stats?.active ?? 0 },
              { label: 'Горячий', color: 'var(--warning)', n: stats?.hot ?? 0 },
              { label: 'Оплатил', color: 'var(--success)', n: stats?.paid ?? 0 },
              { label: 'Слился', color: 'var(--danger)', n: stats?.lost ?? 0 },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '14px 8px', background: 'var(--bg3)', borderRadius: 10 }}>
                <div style={{ fontSize: 20, fontFamily: 'Instrument Serif, serif', fontWeight: 600, color: s.color, marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, delta, up }: any) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {delta && <div className={`stat-delta ${up ? 'delta-up' : 'delta-dn'}`}>{up ? '↑' : '↓'} {delta}</div>}
    </div>
  )
}
