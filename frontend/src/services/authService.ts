import api from './api'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/profile')
    return response.data
  },

  getToken: (): string | null => {
    return localStorage.getItem('token')
  }
}

export default authService
