import { api } from "./api"

export interface Trip {
  id: number
  origin: string
  destination: string
  status: string
  cargoWeightKg?: number
  driver?: { firstName: string; lastName: string }
  vehicle?: { vehicleNumber: string; model: string }
}

export const listTrips = async (filters: Record<string, string | number> = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value))
    }
  })
  const query = params.toString() ? `?${params.toString()}` : ""
  return api.get(`/trips${query}`) as Promise<{ trips: Trip[] }>
}

export const createTrip = async (payload: {
  vehicleId: number
  driverId: number
  origin: string
  destination: string
  scheduledDeparture: string
  scheduledArrival?: string
  cargoWeightKg?: number
}) => {
  return api.post("/trips", payload) as Promise<{ trip: Trip }>
}
