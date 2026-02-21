import { api } from "./api"

export interface Vehicle {
  id: number
  vehicleNumber: string
  registrationNumber: string
  make: string
  model: string
  year: number
  type: string
  fuelType: string
  status: string
  currentMileage: number
  maxLoadCapacity?: number
}

export const listVehicles = async (filters: Record<string, string | number> = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value))
    }
  })

  const query = params.toString() ? `?${params.toString()}` : ""
  return api.get(`/vehicles${query}`) as Promise<{ vehicles: Vehicle[] }>
}

export const createVehicle = async (payload: Partial<Vehicle> & { vehicleNumber: string; registrationNumber: string; make: string; model: string; year: number }) => {
  return api.post("/vehicles", payload) as Promise<{ vehicle: Vehicle }>
}

export const deleteVehicle = async (id: number) => {
  return api.del(`/vehicles/${id}`)
}
