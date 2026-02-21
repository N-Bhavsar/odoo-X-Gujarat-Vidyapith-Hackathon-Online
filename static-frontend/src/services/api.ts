const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const getToken = () => localStorage.getItem("token")

const request = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")

  const token = getToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  })

  const contentType = response.headers.get("content-type") || ""
  const payload = contentType.includes("application/json") ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message || "Request failed"
    throw new Error(message)
  }

  return payload
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: unknown) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: "DELETE" })
}

export const setToken = (token: string) => {
  localStorage.setItem("token", token)
}

export const clearToken = () => {
  localStorage.removeItem("token")
}

export const getStoredToken = getToken
