import { create } from 'zustand'
import { authApi } from '@/api'

interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
}

interface AuthState {
  user: User | null
  isAuth: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; username: string; password: string; password2: string }) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuth: !!localStorage.getItem('access'),
  loading: false,

  login: async (email, password) => {
    const { data } = await authApi.login(email, password)
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    set({ user: data.user, isAuth: true })
  },

  register: async (formData) => {
    const { data } = await authApi.register(formData)
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    set({ user: data.user, isAuth: true })
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh') || ''
    try { await authApi.logout(refresh) } catch {}
    localStorage.clear()
    set({ user: null, isAuth: false })
  },

  loadUser: async () => {
    if (!localStorage.getItem('access')) return
    set({ loading: true })
    try {
      const { data } = await authApi.me()
      set({ user: data, isAuth: true })
    } catch {
      localStorage.clear()
      set({ isAuth: false })
    } finally {
      set({ loading: false })
    }
  },
}))
