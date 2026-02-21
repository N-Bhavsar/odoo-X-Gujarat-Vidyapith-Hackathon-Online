import api from './api'

const API_BASE_URL = '/api/drivers'
const ASSIGNMENTS_API = '/api/assignments'

interface DriverPayload {
  userId: number
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  licenseClass: string
  licenseExpiryDate: string
  licenseIssueDate?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  status?: string
  hireDate?: string
  dateOfBirth?: string
  passportNumber?: string
  medicalCertificateExpiry?: string
  backgroundCheckDate?: string
  notes?: string
}

// Get all drivers
export const getAllDrivers = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.includeExpiring && { includeExpiring: 'true' })
    })

    const response = await api.get(`${API_BASE_URL}?${params}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get driver by ID
export const getDriverById = async (id: number) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Create driver
export const createDriver = async (driverData: DriverPayload) => {
  try {
    const response = await api.post(API_BASE_URL, driverData)
    return response.data
  } catch (error) {
    throw error
  }
}

// Update driver
export const updateDriver = async (id: number, driverData: Partial<DriverPayload>) => {
  try {
    const response = await api.put(`${API_BASE_URL}/${id}`, driverData)
    return response.data
  } catch (error) {
    throw error
  }
}

// Update driver status
export const updateDriverStatus = async (id: number, status: string) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/${id}/status`, { status })
    return response.data
  } catch (error) {
    throw error
  }
}

// Update safety score
export const updateSafetyScore = async (id: number, safetyScore: number) => {
  try {
    const response = await api.patch(`${API_BASE_URL}/${id}/safety-score`, { safetyScore })
    return response.data
  } catch (error) {
    throw error
  }
}

// Delete driver
export const deleteDriver = async (id: number) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get driver license expiry check
export const checkLicenseExpiry = async (id: number) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}/license/check`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get drivers with expiring licenses
export const getExpiringLicenses = async (daysThreshold = 30) => {
  try {
    const response = await api.get(`${API_BASE_URL}/expiring/licenses?daysThreshold=${daysThreshold}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get driver metrics
export const getDriverMetrics = async (id: number) => {
  try {
    const response = await api.get(`${API_BASE_URL}/${id}/metrics`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Increment trip counter
export const incrementTripCounter = async (id: number, type = 'total') => {
  try {
    const response = await api.patch(`${API_BASE_URL}/${id}/trips`, { type })
    return response.data
  } catch (error) {
    throw error
  }
}

// Assignment API functions
interface AssignmentPayload {
  driverId: number
  vehicleId: number
  notes?: string
}

// Get active assignments
export const getActiveAssignments = async (page = 1, limit = 10, filters?: any) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(filters?.driverId && { driverId: String(filters.driverId) }),
      ...(filters?.vehicleId && { vehicleId: String(filters.vehicleId) })
    })

    const response = await api.get(`${ASSIGNMENTS_API}?${params}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get driver's current assignment
export const getDriverCurrentAssignment = async (driverId: number) => {
  try {
    const response = await api.get(`${ASSIGNMENTS_API}/driver/${driverId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get vehicle assigned drivers
export const getVehicleAssignedDrivers = async (vehicleId: number) => {
  try {
    const response = await api.get(`${ASSIGNMENTS_API}/vehicle/${vehicleId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Assign driver to vehicle
export const assignDriverToVehicle = async (assignmentData: AssignmentPayload) => {
  try {
    const response = await api.post(ASSIGNMENTS_API, assignmentData)
    return response.data
  } catch (error) {
    throw error
  }
}

// Unassign driver from vehicle
export const unassignDriverFromVehicle = async (assignmentId: number, reason?: string) => {
  try {
    const response = await api.delete(`${ASSIGNMENTS_API}/${assignmentId}`, {
      data: { reason }
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// Get driver assignment history
export const getDriverAssignmentHistory = async (driverId: number) => {
  try {
    const response = await api.get(`${ASSIGNMENTS_API}/driver/history/${driverId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Get vehicle assignment history
export const getVehicleAssignmentHistory = async (vehicleId: number) => {
  try {
    const response = await api.get(`${ASSIGNMENTS_API}/vehicle/history/${vehicleId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// Validate driver-vehicle compatibility
export const validateCompatibility = async (driverId: number, vehicleId: number) => {
  try {
    const response = await api.post(`${ASSIGNMENTS_API}/validate`, { driverId, vehicleId })
    return response.data
  } catch (error) {
    throw error
  }
}
