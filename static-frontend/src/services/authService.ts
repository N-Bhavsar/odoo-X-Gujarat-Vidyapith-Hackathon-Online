import { api, setToken, clearToken } from "./api"

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
}

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password })
  if (response.token) {
    setToken(response.token)
  }
  return response as { token: string; user: AuthUser }
}

export const register = async (payload: {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
  phone?: string
}) => {
  const response = await api.post("/auth/register", payload)
  if (response.token) {
    setToken(response.token)
  }
  return response as { token: string; user: AuthUser }
}

export const getProfile = async () => {
  return api.get("/auth/me") as Promise<{ user: AuthUser }>
}

export const logout = () => {
  clearToken()
}
