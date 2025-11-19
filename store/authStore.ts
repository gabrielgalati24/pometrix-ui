import { create } from "zustand"
import { authService } from "@/lib/auth-service"
import type { User, LoginCredentials } from "@/types/auth.types"

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  verifyToken: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.login(credentials)
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error al iniciar sesión",
        isLoading: false,
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error al cerrar sesión",
        isLoading: false,
      })
    }
  },

  verifyToken: async () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      set({ isAuthenticated: false })
      return
    }

    set({ isLoading: true })
    try {
      const response = await authService.verifyToken(token)
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  },

  clearError: () => set({ error: null }),
}))
