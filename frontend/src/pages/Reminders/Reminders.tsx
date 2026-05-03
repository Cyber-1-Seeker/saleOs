import { useEffect, useState } from 'react'
import { remindersApi, clientsApi } from '@/api'
import { Modal, FormGroup, Input, Textarea, Select, Avatar } from '@/components/ui'
import dayjs from 'dayjs'

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
]

const PRIORITY_COLOR: Record<string, string> = {
  low: 'var(--info)',
  medium: 'var(--accent)',
  high: 'var(--danger)',
}

const EMPTY_FORM = { title: '', notes: '', due_date: '', priority: 'medium', client: '' }

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState('upcoming')
  const [clients, setClients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [rRes, sRes] = await Promise.all([
      remindersApi.list({ filter }),
      remindersApi.stats(),
    ])
    setReminders(rRes.data.results ?? rRes.data)
    setStats(sRes.data)
  }

  useEffect(() => { load() }, [filter])
  useEffect(() => {
    clientsApi.list().then((r) => setClients(r.data.results ?? r.data))
  }, [])

  const openCreate = () => {
    setEditItem(null)
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm')
    setForm({ ...EMPTY_FORM, due_date: tomorrow })
    setShowForm(true)
  }

  const openEdit = (r: any) => {
    setEditItem(r)
    setForm({
      title: r.title, notes: r.notes, priority: r.priority, client: r.client ?? '',
      due_date: dayjs(r.due_date).format('YYYY-MM-DDTHH:mm'),
    })
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...form, client: form.client || null }
      if (editItem) {
        await remindersApi.update(editItem.id, payload)
      } else {
        await remindersApi.create(payload)
      }
      setShowForm(false); load()
    } finally { setSaving(false) }
  }

  const complete = async (id: number) => {
    await remindersApi.complete(id)
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить напоминание?')) return
    await remindersApi.delete(id)
    load()
  }

  const FILTERS = [
    { v: 'overdue', l: `Просрочено`, count: stats?.overdue },
    { v: 'today', l: 'Сегодня', count: stats?.today },
    { v: 'upcoming', l: 'Предстоящие', count: stats?.upcoming },
    { v: 'done', l: 'Выполнено' },
  ]

  return (
    <div className="page-enter">
      {/* Stats row */}
      <div className="stats-row mb-24" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Всего активных</div>
          <div className="stat-value">{stats?.total ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Просрочено</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats?.overdue ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Сегодня</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.today ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Предстоящие</div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{stats?.upcoming ?? '—'}</div>
        </div>
      </div>

      <div className="flex-center gap-8 mb-24">
        <div className="filter-tabs" style={{ flex: 1 }}>
          {FILTERS.map((f) => (
            <button
              key={f.v}
              className={`ftab ${filter === f.v ? 'active' : ''}`}
              onClick={() => setFilter(f.v)}
            >
              {f.l}
              {f.count !== undefined && f.count > 0 && (
                <span style={{ marginLeft: 5, background: f.v === 'overdue' ? 'var(--danger)' : 'rgba(255,255,255,0.25)', borderRadius: 8, padding: '0 5px', fontSize: 10 }}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Напоминание</button>
      </div>

      {/* List */}
      <div className="card">
        {reminders.length === 0 && (
          <div style={{ padding: '52px 24px', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◷</div>
            <div style={{ fontSize: 13 }}>Напоминаний нет</div>
          </div>
        )}
        {reminders.map((r) => {
          const overdue = r.is_overdue
          return (
            <div
              key={r.id}
              className="reminder-item"
              style={{
                borderBottom: '1px solid var(--border)',
                borderRadius: 0,
                padding: '14px 22px',
                background: overdue ? 'rgba(184,85,85,0.04)' : undefined,
              }}
              onClick={() => openEdit(r)}
            >
              <div
                className="r-dot"
                style={{ background: overdue ? 'var(--danger)' : PRIORITY_COLOR[r.priority], marginTop: 5 }}
              />
              <div style={{ flex: 1 }}>
                <div className="r-title" style={{ textDecoration: r.is_done ? 'line-through' : undefined, color: r.is_done ? 'var(--text3)' : undefined }}>
                  {r.title}
                </div>
                <div className="r-sub" style={{ marginTop: 3 }}>
                  {r.client_name && (
                    <span style={{ marginRight: 8, fontWeight: 500, color: 'var(--accent)' }}>{r.client_name}</span>
                  )}
                  {overdue
                    ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Просрочено · {dayjs(r.due_date).format('DD.MM HH:mm')}</span>
                    : dayjs(r.due_date).format('DD.MM.YYYY · HH:mm')
                  }
                  {r.notes && <span style={{ marginLeft: 8, color: 'var(--text3)' }}>· {r.notes.slice(0, 40)}…</span>}
                </div>
              </div>
              <div className="r-actions" onClick={(e) => e.stopPropagation()}>
                {!r.is_done && (
                  <button
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--success)' }}
                    onClick={() => complete(r.id)}
                    title="Выполнено"
                  >✓</button>
                )}
                <button
                  className="btn btn-xs"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => remove(r.id)}
                  title="Удалить"
                >✕</button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditItem(null) }}
        title={editItem ? 'Редактировать напоминание' : 'Новое напоминание'}
        footer={
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        }
      >
        <div style={{ padding: '24px 26px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormGroup label="Задача">
              <Input placeholder="Написать Алибеку — дожать по Camry" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </FormGroup>
          </div>
          <FormGroup label="Клиент">
            <Select
              value={String(form.client)}
              onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))}
              options={[{ value: '', label: '— без клиента —' }, ...clients.map((c) => ({ value: String(c.id), label: c.name }))]}
            />
          </FormGroup>
          <FormGroup label="Приоритет">
            <Select options={PRIORITY_OPTIONS} value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} />
          </FormGroup>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormGroup label="Дата и время">
              <Input type="datetime-local" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Заметка">
              <Textarea rows={2} placeholder="Детали, что сказать..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </FormGroup>
          </div>
        </div>
      </Modal>
    </div>
  )
}
