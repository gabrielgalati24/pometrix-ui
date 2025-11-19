import type { AuthResponse, LoginCredentials, RegisterCredentials } from "@/types/auth.types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.stg.doculyzer.ai/api"

interface LoginApiResponse {
  refresh: string
  access: string
  username: string
  roles: string[]
}

interface OrganizationsApiResponse {
  message: string
  organizations: Array<{
    id: number
    name: string
    enable: boolean
    mail: string
    posting_types: Array<{ id: number; name: string }>
    document_types: Array<{ id: number; name: string }>
    sas_uri: string | null
    container_name: string
  }>
}

export const authService = {
  /**
   * Login con username y contraseña
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/organization/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.email,
          password: credentials.password,
        }),
      })

      if (!response.ok) {
        throw new Error("Credenciales inválidas")
      }

      const data: LoginApiResponse = await response.json()

      // Guardar tokens en localStorage
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)

      return {
        user: {
          id: data.username,
          email: data.username,
          name: data.username,
          role: data.roles.includes("admin") ? "admin" : "user",
        },
        token: data.access,
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Error al iniciar sesión")
    }
  },

  /**
   * Registro de nuevo usuario (no implementado en API)
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    throw new Error("Registro no disponible. Contacte al administrador.")
  },

  /**
   * Verifica si el token es válido consultando las organizaciones
   */
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/organization/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Token inválido")
      }

      const data: OrganizationsApiResponse = await response.json()

      // Extraer username del token JWT (decodificar payload)
      const payload = JSON.parse(atob(token.split(".")[1]))
      const username = payload.user_id || "user"

      return {
        user: {
          id: username,
          email: username,
          name: username,
          role: "user",
        },
        token,
      }
    } catch {
      throw new Error("Token inválido o expirado")
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  },
}
