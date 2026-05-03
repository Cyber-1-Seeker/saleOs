import { useEffect, useState } from 'react'
import { templatesApi } from '@/api'
import { Modal, FormGroup, Input, Textarea, Select } from '@/components/ui'

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'Общее' },
  { value: 'greeting', label: 'Приветствие' },
  { value: 'payment', label: 'Оплата' },
  { value: 'delivery', label: 'Доставка' },
  { value: 'followup', label: 'Дожим' },
  { value: 'other', label: 'Другое' },
]

const CATEGORY_LABEL: Record<string, string> = {
  general: 'Общее', greeting: 'Приветствие', payment: 'Оплата',
  delivery: 'Доставка', followup: 'Дожим', other: 'Другое',
}

const EMPTY_FORM = { title: '', body: '', category: 'general', emoji: '💬' }

export default function Templates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  const load = async () => {
    let res
    try {
      res = await templatesApi.list({ category: filter || undefined })
    } catch {
      await templatesApi.initDefaults()
      res = await templatesApi.list({ category: filter || undefined })
    }
    const data = res.data.results ?? res.data
    if (!data.length && !filter) {
      await templatesApi.initDefaults()
      const r2 = await templatesApi.list()
      setTemplates(r2.data.results ?? r2.data)
    } else {
      setTemplates(data)
    }
  }

  useEffect(() => { load() }, [filter])

  const copy = async (t: any) => {
    await navigator.clipboard.writeText(t.body)
    await templatesApi.use(t.id)
    setCopied(t.id)
    setTimeout(() => setCopied(null), 2000)
    setTemplates((prev) => prev.map((x) => x.id === t.id ? { ...x, use_count: x.use_count + 1 } : x))
  }

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (t: any) => {
    setEditItem(t)
    setForm({ title: t.title, body: t.body, category: t.category, emoji: t.emoji })
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editItem) {
        await templatesApi.update(editItem.id, form)
      } else {
        await templatesApi.create(form)
      }
      setShowForm(false); load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить шаблон?')) return
    await templatesApi.delete(id)
    load()
  }

  return (
    <div className="page-enter">
      <div className="flex-center gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
        <div className="filter-tabs" style={{ flex: 1 }}>
          <button className={`ftab ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>Все</button>
          {CATEGORY_OPTIONS.map((c) => (
            <button key={c.value} className={`ftab ${filter === c.value ? 'active' : ''}`} onClick={() => setFilter(c.value)}>
              {c.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Шаблон</button>
      </div>

      {templates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '52px 24px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>▤</div>
          <div style={{ fontSize: 13 }}>Шаблонов нет</div>
        </div>
      )}

      <div className="templates-grid">
        {templates.map((t) => (
          <div key={t.id} className="tmpl-card">
            <div className="tmpl-emoji">{t.emoji}</div>
            <div className="tmpl-title">{t.title}</div>
            <div className="tmpl-body">{t.body}</div>
            <div className="tmpl-footer">
              <span className="tmpl-cat">{CATEGORY_LABEL[t.category] ?? t.category}</span>
              <div className="flex-center gap-8">
                {t.use_count > 0 && (
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>×{t.use_count}</span>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => copy(t)}
                  style={copied === t.id ? { color: 'var(--success)' } : {}}
                >
                  {copied === t.id ? '✓ Скопировано' : '⎘ Копировать'}
                </button>
                <button className="btn btn-ghost btn-xs" onClick={() => openEdit(t)}>✎</button>
                <button className="btn btn-xs" style={{ color: 'var(--danger)' }} onClick={() => remove(t.id)}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editItem ? 'Редактировать шаблон' : 'Новый шаблон'}
        footer={
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        }
      >
        <div style={{ padding: '24px 26px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '0 12px' }}>
            <FormGroup label="Emoji">
              <Input value={form.emoji} onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))} style={{ textAlign: 'center', fontSize: 18 }} />
            </FormGroup>
            <FormGroup label="Название">
              <Input placeholder="Первое приветствие" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </FormGroup>
          </div>
          <FormGroup label="Категория">
            <Select options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Текст шаблона">
            <Textarea
              rows={5}
              placeholder="Текст сообщения... Используй [имя] как плейсхолдер"
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            />
          </FormGroup>
        </div>
      </Modal>
    </div>
  )
}
