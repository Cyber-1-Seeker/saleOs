import api from './client'

// ─── AUTH ───
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),
  register: (data: { email: string; username: string; password: string; password2: string }) =>
    api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
  logout: (refresh: string) => api.post('/auth/logout/', { refresh }),
}

// ─── CLIENTS ───
export const clientsApi = {
  list: (params?: { status?: string; search?: string }) =>
    api.get('/clients/', { params }),
  get: (id: number) => api.get(`/clients/${id}/`),
  create: (data: object) => api.post('/clients/', data),
  update: (id: number, data: object) => api.patch(`/clients/${id}/`, data),
  delete: (id: number) => api.delete(`/clients/${id}/`),
  addMessage: (id: number, data: object) => api.post(`/clients/${id}/add_message/`, data),
  stats: () => api.get('/clients/stats/'),
}

// ─── PIPELINE ───
export const pipelineApi = {
  stages: () => api.get('/pipeline/stages/'),
  initStages: () => api.post('/pipeline/stages/init_defaults/'),
  createStage: (data: object) => api.post('/pipeline/stages/', data),
  deals: (params?: { stage?: number }) => api.get('/pipeline/deals/', { params }),
  createDeal: (data: object) => api.post('/pipeline/deals/', data),
  updateDeal: (id: number, data: object) => api.patch(`/pipeline/deals/${id}/`, data),
  moveDeal: (id: number, stage: number, order: number) =>
    api.patch(`/pipeline/deals/${id}/move/`, { stage, order }),
  deleteDeal: (id: number) => api.delete(`/pipeline/deals/${id}/`),
}

// ─── TEMPLATES ───
export const templatesApi = {
  list: (params?: { category?: string }) => api.get('/templates/', { params }),
  create: (data: object) => api.post('/templates/', data),
  update: (id: number, data: object) => api.patch(`/templates/${id}/`, data),
  delete: (id: number) => api.delete(`/templates/${id}/`),
  use: (id: number) => api.post(`/templates/${id}/use/`),
  initDefaults: () => api.post('/templates/init_defaults/'),
}

// ─── CATALOG ───
export const catalogApi = {
  list: (params?: { client?: number }) => api.get('/catalog/', { params }),
  get: (id: number) => api.get(`/catalog/${id}/`),
  create: (data: object) => api.post('/catalog/', data),
  update: (id: number, data: object) => api.patch(`/catalog/${id}/`, data),
  delete: (id: number) => api.delete(`/catalog/${id}/`),
  uploadMedia: (id: number, files: File[], mediaType: string) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    form.append('media_type', mediaType)
    return api.post(`/catalog/${id}/upload_media/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteMedia: (itemId: number, mediaId: number) =>
    api.delete(`/catalog/${itemId}/media/${mediaId}/`),
}

// ─── REMINDERS ───
export const remindersApi = {
  list: (params?: { filter?: string; client?: number }) =>
    api.get('/reminders/', { params }),
  create: (data: object) => api.post('/reminders/', data),
  update: (id: number, data: object) => api.patch(`/reminders/${id}/`, data),
  delete: (id: number) => api.delete(`/reminders/${id}/`),
  complete: (id: number) => api.post(`/reminders/${id}/complete/`),
  stats: () => api.get('/reminders/stats/'),
}
