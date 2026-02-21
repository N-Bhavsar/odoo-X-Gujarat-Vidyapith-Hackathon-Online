import { api } from "./api"

export interface Driver {
  id: number
  firstName: string
  lastName: string
  email: string
  licenseNumber: string
  licenseExpiryDate: string
  safetyScore: number
  totalTrips: number
  completedTrips: number
  cancelledTrips: number
  status: string
}

export const listDrivers = async (filters: Record<string, string | number> = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value))
    }
  })
  const query = params.toString() ? `?${params.toString()}` : ""
  return api.get(`/drivers${query}`) as Promise<{ drivers: Driver[] }>
}

export const createDriver = async (data: any) => {
  return api.post('/drivers', data);
}

export const updateDriverStatus = async (id: number, status: string) => {
  return api.patch(`/drivers/${id}/status`, { status });
}
