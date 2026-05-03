import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { pipelineApi, clientsApi } from '@/api'
import { Modal, FormGroup, Input, Select } from '@/components/ui'

const COL_COLORS: Record<string, string> = {
  'Новый лид': 'var(--info)',
  'Прогрев': 'var(--accent)',
  'Обсуждение': 'var(--warning)',
  'Закрытие': '#9B6FE0',
  'Оплата': 'var(--success)',
}

// Renders drag clone in document.body to avoid scroll/overflow offset issues
function PortalAwareItem({ provided, snapshot, children }: {
  provided: any
  snapshot: any
  children: React.ReactNode
}) {
  const child = (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={provided.draggableProps.style}
    >
      {children}
    </div>
  )

  if (!snapshot.isDragging) return child
  return createPortal(child, document.body)
}

export default function Pipeline() {
  const [stages, setStages] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editDeal, setEditDeal] = useState<any>(null)
  const [form, setForm] = useState({ title: '', amount: '', client: '', stage: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [sRes, dRes] = await Promise.all([pipelineApi.stages(), pipelineApi.deals()])
    let stagesData = sRes.data.results ?? sRes.data
    if (!stagesData.length) {
      const init = await pipelineApi.initStages()
      stagesData = init.data.results ?? init.data
    }
    setStages(stagesData)
    setDeals(dRes.data.results ?? dRes.data)
  }

  useEffect(() => {
    load()
    clientsApi.list().then((r) => setClients(r.data.results ?? r.data))
  }, [])

  const dealsForStage = (stageId: number) =>
    deals.filter((d) => d.stage === stageId).sort((a, b) => a.order - b.order)

  const totalForStage = (stageId: number) =>
    deals.filter((d) => d.stage === stageId).reduce((s, d) => s + Number(d.amount || 0), 0)

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const dealId = Number(draggableId)
    const newStageId = Number(destination.droppableId)

    setDeals((prev) =>
      prev.map((d) => d.id === dealId ? { ...d, stage: newStageId, order: destination.index } : d)
    )

    try {
      await pipelineApi.moveDeal(dealId, newStageId, destination.index)
    } catch {
      load()
    }
  }

  const openCreate = (stageId?: number) => {
    setEditDeal(null)
    setForm({
      title: '', amount: '', client: '', notes: '',
      stage: stageId ? String(stageId) : String(stages[0]?.id ?? ''),
    })
    setShowForm(true)
  }

  const openEdit = (deal: any) => {
    setEditDeal(deal)
    setForm({
      title: deal.title,
      amount: deal.amount ?? '',
      client: String(deal.client ?? ''),
      stage: String(deal.stage),
      notes: deal.notes,
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = { ...form, amount: form.amount || null, client: form.client || null }
      if (editDeal) {
        await pipelineApi.updateDeal(editDeal.id, payload)
      } else {
        await pipelineApi.createDeal(payload)
      }
      setShowForm(false)
      load()
    } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Удалить сделку?')) return
    await pipelineApi.deleteDeal(id)
    load()
  }

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => openCreate()}>+ Сделка</button>
      </div>

      {/*
        DRAG FIX:
        The .content div has overflow-y:auto which causes dnd to miscalculate
        drag positions. We fix this by:
        1. Wrapping the board in a plain overflow-x:auto div (not the dnd context)
        2. Using createPortal in PortalAwareItem to render the drag clone at body level
        This means the clone's fixed position is calculated correctly vs the viewport.
      */}
      <div style={{ overflowX: 'auto', paddingBottom: 16, marginBottom: 4 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: 14, minWidth: 'max-content', alignItems: 'flex-start' }}>
            {stages.map((stage) => {
              const stageDeals = dealsForStage(stage.id)
              const total = totalForStage(stage.id)
              const color = COL_COLORS[stage.name] || stage.color || 'var(--accent)'

              return (
                <div
                  key={stage.id}
                  style={{
                    width: 234,
                    flexShrink: 0,
                    background: 'var(--bg2)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Column header */}
                  <div style={{ padding: '14px 14px 10px', flexShrink: 0 }}>
                    <div style={{ height: 2, borderRadius: 1, background: color, marginBottom: 10 }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{stage.name}</span>
                      <span style={{
                        fontSize: 10, background: 'var(--bg4)', color: 'var(--text3)',
                        padding: '1px 7px', borderRadius: 8, fontWeight: 600,
                      }}>{stageDeals.length}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {total > 0 ? `$${total.toLocaleString()}` : 'Нет сделок'}
                    </div>
                  </div>

                  {/* Droppable */}
                  <Droppable droppableId={String(stage.id)}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          flex: 1,
                          padding: '0 10px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          minHeight: 80,
                          borderRadius: '0 0 12px 12px',
                          transition: 'background 0.12s',
                          background: snapshot.isDraggingOver ? 'var(--accent-bg)' : 'transparent',
                        }}
                      >
                        {stageDeals.map((deal, index) => (
                          <Draggable key={deal.id} draggableId={String(deal.id)} index={index}>
                            {(prov, snap) => (
                              <PortalAwareItem provided={prov} snapshot={snap}>
                                <div
                                  style={{
                                    background: snap.isDragging ? 'var(--bg2)' : 'var(--bg3)',
                                    border: `1px solid ${snap.isDragging ? 'var(--accent)' : 'var(--border)'}`,
                                    borderRadius: 8,
                                    padding: 12,
                                    cursor: snap.isDragging ? 'grabbing' : 'grab',
                                    boxShadow: snap.isDragging ? '0 12px 32px rgba(0,0,0,0.4)' : 'none',
                                    userSelect: 'none',
                                    // Prevent flash-back animation on drop
                                    transition: snap.isDragging ? 'none' : 'background 0.12s, border-color 0.12s',
                                  }}
                                  onClick={() => !snap.isDragging && openEdit(deal)}
                                >
                                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{deal.title}</div>
                                  {deal.client_name && (
                                    <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 5 }}>{deal.client_name}</div>
                                  )}
                                  {deal.notes && (
                                    <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 5 }}>
                                      {deal.notes.slice(0, 55)}{deal.notes.length > 55 ? '…' : ''}
                                    </div>
                                  )}
                                  <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border)',
                                  }}>
                                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                                      {deal.client_name ? '◉' : '○'}
                                    </span>
                                    {deal.amount && (
                                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>
                                        ${Number(deal.amount).toLocaleString()}
                                      </span>
                                    )}
                                    <button
                                      style={{
                                        fontSize: 11, color: 'var(--text3)', padding: '1px 4px',
                                        borderRadius: 4, border: 'none', background: 'none',
                                        cursor: 'pointer', transition: 'color 0.12s',
                                      }}
                                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
                                      onClick={(e) => { e.stopPropagation(); remove(deal.id) }}
                                    >✕</button>
                                  </div>
                                </div>
                              </PortalAwareItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        <button
                          style={{
                            width: '100%', padding: '7px', borderRadius: 8, fontSize: 12,
                            color: 'var(--text3)', border: '1px dashed var(--border2)',
                            background: 'none', cursor: 'pointer', transition: 'all 0.12s',
                            fontFamily: 'inherit', marginTop: stageDeals.length ? 2 : 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--accent)'
                            e.currentTarget.style.borderColor = 'var(--accent)'
                            e.currentTarget.style.background = 'var(--accent-bg)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text3)'
                            e.currentTarget.style.borderColor = 'var(--border2)'
                            e.currentTarget.style.background = 'none'
                          }}
                          onClick={() => openCreate(stage.id)}
                        >
                          + добавить
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Form modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editDeal ? 'Редактировать сделку' : 'Новая сделка'}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Отмена</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        }
        width={520}
      >
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <FormGroup label="Название *">
                <Input
                  placeholder="Toyota Camry — Алибек"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  autoFocus
                />
              </FormGroup>
            </div>
            <FormGroup label="Клиент">
              <Select
                value={form.client}
                onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))}
                options={[
                  { value: '', label: '— без клиента —' },
                  ...clients.map((c) => ({ value: String(c.id), label: c.name })),
                ]}
              />
            </FormGroup>
            <FormGroup label="Этап">
              <Select
                value={form.stage}
                onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
                options={stages.map((s) => ({ value: String(s.id), label: s.name }))}
              />
            </FormGroup>
            <FormGroup label="Сумма ($)">
              <Input
                type="number"
                placeholder="18000"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
            </FormGroup>
            <FormGroup label="Заметка">
              <Input
                placeholder="Короткая заметка..."
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </FormGroup>
          </div>
        </div>
      </Modal>
    </div>
  )
}
