import { create } from 'zustand'
import { authApi, User } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const { data } = await authApi.login({ username, password })
    localStorage.setItem('token', data.token)
    set({ 
      token: data.token, 
      user: data.user, 
      isAuthenticated: true,
      isLoading: false 
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ 
      token: null, 
      user: null, 
      isAuthenticated: false 
    })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }

    try {
      const { data } = await authApi.me()
      set({ 
        user: data, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch {
      localStorage.removeItem('token')
      set({ 
        token: null, 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      })
    }
  },
}))
