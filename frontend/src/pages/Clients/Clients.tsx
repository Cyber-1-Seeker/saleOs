import { useEffect, useState } from 'react'
import { clientsApi } from '@/api'
import { Modal, FormGroup, Input, Textarea, Select, Avatar } from '@/components/ui'
import dayjs from 'dayjs'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'active', label: 'В работе' },
  { value: 'hot', label: 'Горячий' },
  { value: 'cold', label: 'Холодный' },
  { value: 'paid', label: 'Оплатил' },
  { value: 'lost', label: 'Слился' },
]
const CHANNEL_OPTIONS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'phone', label: 'Телефон' },
  { value: 'other', label: 'Другое' },
]
const STATUS_BADGE: Record<string, string> = {
  new: 'badge-new', hot: 'badge-hot', active: 'badge-active',
  cold: 'badge-cold', paid: 'badge-paid', lost: 'badge-lost',
}
const STATUS_LABEL: Record<string, string> = {
  new: 'Новый', hot: 'Горячий', active: 'В работе',
  cold: 'Холодный', paid: 'Оплатил', lost: 'Слился',
}
const CHANNEL_ICON: Record<string, string> = {
  telegram: '✈', whatsapp: '💬', instagram: '◎', phone: '☎', other: '◉',
}

const EMPTY_FORM = {
  name: '', nickname: '', channel: 'telegram', contact: '', interest: '',
  budget_min: '', budget_max: '', status: 'new', notes: '',
}

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    const { data } = await clientsApi.list({ status: filter || undefined, search: search || undefined })
    setClients(data.results ?? data)
  }

  useEffect(() => { load() }, [filter, search])

  const openClient = async (c: any) => {
    const { data } = await clientsApi.get(c.id)
    setSelected(data)
    setShowForm(false)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setSelected(null)
    setShowForm(true)
  }

  const openEdit = async (c: any, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const { data } = await clientsApi.get(c.id)
    setEditingId(data.id)
    setForm({
      name: data.name, nickname: data.nickname, channel: data.channel,
      contact: data.contact, interest: data.interest,
      budget_min: data.budget_min ?? '', budget_max: data.budget_max ?? '',
      status: data.status, notes: data.notes,
    })
    setSelected(null)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await clientsApi.update(editingId, form)
      } else {
        await clientsApi.create(form)
      }
      setShowForm(false)
      setEditingId(null)
      load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить клиента?')) return
    await clientsApi.delete(id)
    setSelected(null)
    load()
  }

  const sendMessage = async () => {
    if (!message.trim() || !selected) return
    await clientsApi.addMessage(selected.id, { direction: 'out', text: message })
    setMessage('')
    const { data } = await clientsApi.get(selected.id)
    setSelected(data)
  }

  const updateNote = async (notes: string) => {
    if (!selected) return
    await clientsApi.update(selected.id, { notes })
  }

  const f = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  return (
    <div className="page-enter">
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-wrap" style={{ flex: '1 1 200px', minWidth: 180 }}>
          <span style={{ color: 'var(--text3)', fontSize: 14 }}>⌕</span>
          <input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[{ v: '', l: 'Все' }, ...STATUS_OPTIONS.map((s) => ({ v: s.value, l: s.label }))].map((fi) => (
            <button key={fi.v} className={`ftab ${filter === fi.v ? 'active' : ''}`} onClick={() => setFilter(fi.v)}>
              {fi.l}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ flexShrink: 0 }}>
          + Клиент
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-head" style={{ gridTemplateColumns: '2fr 100px 110px 1.2fr 100px 44px' }}>
          <span>Клиент</span><span>Канал</span><span>Статус</span>
          <span>Интерес</span><span>Бюджет</span><span></span>
        </div>
        {clients.map((c) => (
          <div
            key={c.id}
            className="table-row"
            style={{ gridTemplateColumns: '2fr 100px 110px 1.2fr 100px 44px' }}
            onClick={() => openClient(c)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={c.name} size={30} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                {c.nickname && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.nickname}</div>}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{CHANNEL_ICON[c.channel]} {c.channel}</div>
            <div><span className={`badge ${STATUS_BADGE[c.status]}`}>{STATUS_LABEL[c.status]}</span></div>
            <div style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.interest || '—'}</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>
              {c.budget_max ? `$${Number(c.budget_max).toLocaleString()}` : '—'}
            </div>
            <div>
              <button
                className="btn btn-ghost btn-xs"
                onClick={(e) => openEdit(c, e)}
                style={{ opacity: 0.7 }}
              >✎</button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div style={{ padding: '52px 22px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            Клиентов нет — добавьте первого
          </div>
        )}
      </div>

      {/* ── CLIENT DETAIL MODAL ── */}
      <Modal
        open={!!selected && !showForm}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        subtitle={selected ? `${selected.nickname ? selected.nickname + ' · ' : ''}${selected.channel}` : ''}
        icon={selected ? <Avatar name={selected.name} size={38} /> : undefined}
        footer={
          selected ? (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(selected)}>✎ Редактировать</button>
              <button className="btn btn-danger btn-sm" onClick={() => remove(selected.id)}>Удалить</button>
              <div style={{ flex: 1 }} />
              <span className={`badge ${STATUS_BADGE[selected?.status]}`} style={{ alignSelf: 'center' }}>
                {STATUS_LABEL[selected?.status]}
              </span>
            </div>
          ) : undefined
        }
        width={700}
      >
        {selected && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 320 }}>
            {/* Left */}
            <div style={{ padding: '22px 20px', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 14 }}>Информация</div>
              {[
                ['Канал', `${CHANNEL_ICON[selected.channel]} ${selected.channel}`],
                ['Контакт', selected.contact || '—'],
                ['Интерес', selected.interest || '—'],
                ['Бюджет', selected.budget || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, textAlign: 'right', color: 'var(--text)' }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 10 }}>Заметки</div>
              <textarea
                className="form-input"
                style={{ minHeight: 80, fontSize: 12 }}
                defaultValue={selected.notes}
                placeholder="Психология клиента, детали..."
                onBlur={(e) => updateNote(e.target.value)}
              />
            </div>
            {/* Right */}
            <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 14 }}>История</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', maxHeight: 220, marginBottom: 12 }}>
                {(selected.messages ?? []).map((m: any) => (
                  <div
                    key={m.id}
                    style={{
                      background: m.direction === 'out' ? 'var(--accent-bg)' : 'var(--bg3)',
                      border: m.direction === 'out' ? '1px solid rgba(184,115,51,0.15)' : '1px solid var(--border)',
                      borderRadius: 8, padding: '8px 10px', fontSize: 12,
                    }}
                  >
                    <div style={{ fontSize: 10, color: m.direction === 'out' ? 'var(--accent)' : 'var(--text3)', marginBottom: 3 }}>
                      {m.direction === 'out' ? 'Исходящее' : 'Входящее'} · {dayjs(m.created_at).format('DD.MM HH:mm')}
                    </div>
                    {m.text}
                  </div>
                ))}
                {(selected.messages ?? []).length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>История пуста</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="form-input"
                  style={{ flex: 1, fontSize: 12 }}
                  placeholder="Добавить запись..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button className="btn btn-primary btn-sm" onClick={sendMessage}>→</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── CREATE / EDIT MODAL ── */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditingId(null) }}
        title={editingId ? 'Редактировать клиента' : 'Новый клиент'}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowForm(false); setEditingId(null) }}>
              Отмена
            </button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        }
        width={620}
      >
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <FormGroup label="Имя *">
              <Input placeholder="Алибек Ж." value={form.name} onChange={f('name')} autoFocus />
            </FormGroup>
            <FormGroup label="Ник / username">
              <Input placeholder="@username" value={form.nickname} onChange={f('nickname')} />
            </FormGroup>
            <FormGroup label="Канал">
              <Select options={CHANNEL_OPTIONS} value={form.channel} onChange={f('channel')} />
            </FormGroup>
            <FormGroup label="Контакт (телефон / ник)">
              <Input placeholder="+7 777 000 00 00" value={form.contact} onChange={f('contact')} />
            </FormGroup>
            <FormGroup label="Интерес (товар)">
              <Input placeholder="Toyota Camry 2022" value={form.interest} onChange={f('interest')} />
            </FormGroup>
            <FormGroup label="Статус">
              <Select options={STATUS_OPTIONS} value={form.status} onChange={f('status')} />
            </FormGroup>
            <FormGroup label="Бюджет от ($)">
              <Input type="number" placeholder="15000" value={form.budget_min} onChange={f('budget_min')} />
            </FormGroup>
            <FormGroup label="Бюджет до ($)">
              <Input type="number" placeholder="25000" value={form.budget_max} onChange={f('budget_max')} />
            </FormGroup>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormGroup label="Заметки">
                <Textarea
                  placeholder="Психология клиента, важные детали, что нельзя забыть..."
                  rows={3}
                  value={form.notes}
                  onChange={f('notes')}
                />
              </FormGroup>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
