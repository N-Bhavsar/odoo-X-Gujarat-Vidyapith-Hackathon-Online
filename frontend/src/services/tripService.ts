import api from './api'

const API_BASE_URL = '/api/trips'

export interface TripPayload {
  vehicleId: number
  driverId: number
  origin: string
  destination: string
  scheduledDeparture: string
  scheduledArrival?: string
  distanceKm?: number
  cargoDescription?: string
  cargoWeightKg?: number
  notes?: string
}

// Get all trips
export const getAllTrips = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.driverId && { driverId: String(filters.driverId) }),
      ...(filters?.vehicleId && { vehicleId: String(filters.vehicleId) }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate })
    })

    const response = await api.get(`${API_BASE_URL}?${params}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get trip by ID
export const getTripById = async (id: number) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Create trip
export const createTrip = async (tripData: TripPayload) => {
  try {
    const response = await api.post(API_BASE_URL, tripData)
    return response.data
  } catch (error) {
    throw error
  }
}

// Update trip
export const updateTrip = async (id: number, tripData: Partial<TripPayload>) => {
  try {
    const response = await api.put(`${API_BASE_URL}/${id}`, tripData)
    return response.data
  } catch (error) {
    throw error
  }
}

// Update trip status
export const updateTripStatus = async (id: number, status: string) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/${id}/status`, { status })
    return response.data
  } catch (error) {
    throw error
  }
}

// Start trip
export const startTrip = async (id: number) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${id}/start`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Complete trip
export const completeTrip = async (id: number) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${id}/complete`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Cancel trip
export const cancelTrip = async (id: number, reason?: string) => {
  try {
    const response = await api.post(`${API_BASE_URL}/${id}/cancel`, { reason })
    return response.data
  } catch (error) {
    throw error
  }
}

// Delete trip
export const deleteTrip = async (id: number) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get trips by driver
export const getTripsByDriver = async (driverId: number, page = 1, limit = 10, status?: string) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status && { status })
    })

    const response = await api.get(`${API_BASE_URL}/driver/${driverId}?${params}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get trips by vehicle
export const getTripsByVehicle = async (vehicleId: number, page = 1, limit = 10, status?: string) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status && { status })
    })

    const response = await api.get(`${API_BASE_URL}/vehicle/${vehicleId}?${params}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get trip statistics
export const getTripStatistics = async (startDate?: string, endDate?: string) => {
  try {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    })

    const queryString = params.toString()
    const response = await api.get(`${API_BASE_URL}/statistics${queryString ? `?${queryString}` : ''}`)
    return response.data
  } catch (error) {
    throw error
  }
}
