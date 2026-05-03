import { useEffect, useRef, useState } from 'react'
import { clientsApi, catalogApi } from '@/api'
import { Modal, FormGroup, Input, Textarea, Avatar } from '@/components/ui'

const EMPTY_FORM = { name: '', description: '', price: '', margin: '', notes: '', client: '' }

export default function Catalog() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    clientsApi.list().then((r) => {
      const data = r.data.results ?? r.data
      setClients(data)
      if (data.length) setSelectedClient(data[0])
    })
  }, [])

  useEffect(() => {
    if (selectedClient) {
      catalogApi.list({ client: selectedClient.id }).then((r) => setItems(r.data.results ?? r.data))
    }
  }, [selectedClient])

  const openCreate = () => {
    setEditItem(null)
    setForm({ ...EMPTY_FORM, client: selectedClient?.id ?? '' })
    setShowForm(true)
  }

  const openEdit = async (item: any) => {
    const { data } = await catalogApi.get(item.id)
    setEditItem(data)
    setSelectedItem(data)
    setForm({ name: data.name, description: data.description, price: data.price ?? '', margin: data.margin ?? '', notes: data.notes, client: data.client ?? '' })
    setShowForm(true)
  }

  const openDetail = async (item: any) => {
    const { data } = await catalogApi.get(item.id)
    setSelectedItem(data)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...form, price: form.price || null, margin: form.margin || null, client: form.client || null }
      if (editItem) {
        await catalogApi.update(editItem.id, payload)
      } else {
        await catalogApi.create(payload)
      }
      setShowForm(false)
      if (selectedClient) {
        const r = await catalogApi.list({ client: selectedClient.id })
        setItems(r.data.results ?? r.data)
      }
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить позицию?')) return
    await catalogApi.delete(id)
    setSelectedItem(null)
    if (selectedClient) {
      const r = await catalogApi.list({ client: selectedClient.id })
      setItems(r.data.results ?? r.data)
    }
  }

  const uploadFiles = async (itemId: number, files: FileList) => {
    setUploading(true)
    try {
      const ext = files[0]?.name.split('.').pop()?.toLowerCase()
      const mediaType = ['mp4', 'mov', 'avi'].includes(ext ?? '') ? 'video' : 'image'
      await catalogApi.uploadMedia(itemId, Array.from(files), mediaType)
      const { data } = await catalogApi.get(itemId)
      setSelectedItem(data)
      const r = await catalogApi.list({ client: selectedClient?.id })
      setItems(r.data.results ?? r.data)
    } finally { setUploading(false) }
  }

  const deleteMedia = async (itemId: number, mediaId: number) => {
    await catalogApi.deleteMedia(itemId, mediaId)
    const { data } = await catalogApi.get(itemId)
    setSelectedItem(data)
  }

  return (
    <div className="page-enter">
      <div className="flex-center justify-between mb-24">
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Каждый клиент — отдельная папка с позициями, фото, видео и заметками
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={!selectedClient}>
          + Добавить позицию
        </button>
      </div>

      <div className="catalog-layout">
        {/* Client list */}
        <div className="client-sidebar">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Клиенты
          </div>
          {clients.map((c) => (
            <div
              key={c.id}
              className={`client-sidebar-item ${selectedClient?.id === c.id ? 'active' : ''}`}
              onClick={() => setSelectedClient(c)}
            >
              <Avatar name={c.name} size={28} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{c.interest || c.channel}</div>
              </div>
            </div>
          ))}
          {clients.length === 0 && (
            <div style={{ padding: '24px 16px', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
              Сначала добавьте клиентов
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-head">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {selectedClient ? `${selectedClient.name} — позиции` : 'Выберите клиента'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                {items.length} позиций
              </div>
            </div>
            {selectedClient && (
              <button className="btn btn-ghost btn-sm" onClick={openCreate}>+ Добавить</button>
            )}
          </div>

          <div className="items-grid">
            {items.map((item) => (
              <div key={item.id} className="item-card" onClick={() => openDetail(item)}>
                <div className="item-thumb">
                  {item.media_count > 0 ? (
                    <span style={{ fontSize: 11, color: 'var(--text2)' }}>📎 {item.media_count} файл(а)</span>
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className="item-body">
                  <div className="item-name">{item.name}</div>
                  {item.description && <div className="item-desc">{item.description.slice(0, 60)}{item.description.length > 60 ? '…' : ''}</div>}
                  <div>
                    {item.price && <span className="item-price">${Number(item.price).toLocaleString()}</span>}
                    {item.margin && <span className="item-margin">+${Number(item.margin).toLocaleString()}</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Add placeholder */}
            <div
              className="item-card"
              style={{ border: '1.5px dashed var(--border2)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160, cursor: 'pointer' }}
              onClick={openCreate}
            >
              <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>+</div>
                <div style={{ fontSize: 11 }}>Добавить</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item detail modal */}
      {selectedItem && !showForm && (
        <Modal
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.name}
          subtitle={selectedItem.client_name}
          footer={
            <div className="flex-center gap-8">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(selectedItem)}>✎ Редактировать</button>
              <button className="btn btn-danger btn-sm" onClick={() => remove(selectedItem.id)}>Удалить</button>
            </div>
          }
          width={680}
        >
          <div style={{ padding: '24px 26px' }}>
            {/* Info row */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              {selectedItem.price && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>Цена</div>
                  <div className="mono" style={{ fontSize: 16, color: 'var(--accent)' }}>${Number(selectedItem.price).toLocaleString()}</div>
                </div>
              )}
              {selectedItem.margin && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>Маржа</div>
                  <div className="mono" style={{ fontSize: 16, color: 'var(--success)' }}>+${Number(selectedItem.margin).toLocaleString()}</div>
                </div>
              )}
            </div>

            {selectedItem.description && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Описание</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{selectedItem.description}</div>
              </div>
            )}

            {selectedItem.notes && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Заметки</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', background: 'var(--bg3)', padding: '10px 12px', borderRadius: 8, lineHeight: 1.6 }}>{selectedItem.notes}</div>
              </div>
            )}

            {/* Media */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                Медиа ({(selectedItem.media ?? []).length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
                {(selectedItem.media ?? []).map((m: any) => (
                  <div key={m.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: 'var(--bg3)', aspectRatio: '1' }}>
                    {m.media_type === 'image' ? (
                      <img src={m.file} alt={m.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 24 }}>
                        {m.media_type === 'video' ? '▶' : '📄'}
                      </div>
                    )}
                    <button
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 4, padding: '1px 5px', fontSize: 10, border: 'none', cursor: 'pointer' }}
                      onClick={() => deleteMedia(selectedItem.id, m.id)}
                    >✕</button>
                  </div>
                ))}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileRef}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && uploadFiles(selectedItem.id, e.target.files)}
                />
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Загружаем...' : '+ Добавить фото/видео'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/edit modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditItem(null) }}
        title={editItem ? 'Редактировать позицию' : 'Новая позиция'}
        footer={
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        }
      >
        <div style={{ padding: '24px 26px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormGroup label="Название">
              <Input placeholder="Toyota Camry 2022 · серый" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </FormGroup>
          </div>
          <FormGroup label="Цена ($)">
            <Input type="number" placeholder="18000" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          </FormGroup>
          <FormGroup label="Маржа ($)">
            <Input type="number" placeholder="2400" value={form.margin} onChange={(e) => setForm((p) => ({ ...p, margin: e.target.value }))} />
          </FormGroup>
          <div style={{ gridColumn: '1 / -1' }}>
            <FormGroup label="Описание / характеристики">
              <Textarea rows={3} placeholder="Год, пробег, цвет, комплектация..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Заметки (только для тебя)">
              <Textarea rows={2} placeholder="Откуда машина, нюансы, детали..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </FormGroup>
          </div>
        </div>
      </Modal>
    </div>
  )
}
