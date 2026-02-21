import api from './api'

export enum VehicleStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
  RETIRED = 'retired'
}

export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  VAN = 'van',
  TRUCK = 'truck',
  BUS = 'bus',
  MOTORCYCLE = 'motorcycle'
}

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  CNG = 'cng'
}

export interface Vehicle {
  id: number
  vehicleNumber: string
  registrationNumber: string
  make: string
  model: string
  year: number
  vin?: string
  type: VehicleType
  fuelType: FuelType
  status: VehicleStatus
  currentMileage: number
  seatingCapacity?: number
  maxLoadCapacity?: number
  color?: string
  purchasePrice?: number
  currentValue?: number
  lastServiceDate?: string
  nextServiceDue?: string
  insuranceNumber?: string
  insuranceExpiryDate?: string
  registrationExpiryDate?: string
  notes?: string
  imageUrl?: string
  assignedDriverId?: number
  createdAt?: string
  updatedAt?: string
}

export interface VehicleFilters {
  status?: VehicleStatus
  type?: VehicleType
  search?: string
  page?: number
  limit?: number
}

export interface VehicleResponse {
  vehicles: Vehicle[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface VehicleStats {
  total: number
  active: number
  maintenance: number
  inactive: number
  byType: Array<{ type: string; count: number }>
}

const vehicleService = {
  // Get all vehicles with filters
  getVehicles: async (filters?: VehicleFilters): Promise<VehicleResponse> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const response = await api.get(`/vehicles?${params.toString()}`)
    return response.data
  },

  // Get vehicle by ID
  getVehicle: async (id: number): Promise<Vehicle> => {
    const response = await api.get(`/vehicles/${id}`)
    return response.data.vehicle
  },

  // Create new vehicle
  createVehicle: async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    console.log('Creating vehicle with data:', vehicleData)
    const response = await api.post('/vehicles', vehicleData)
    console.log('Vehicle creation response:', response.data)
    return response.data.vehicle
  },

  // Update vehicle
  updateVehicle: async (id: number, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.put(`/vehicles/${id}`, vehicleData)
    return response.data.vehicle
  },

  // Delete vehicle
  deleteVehicle: async (id: number): Promise<void> => {
    await api.delete(`/vehicles/${id}`)
  },

  // Get vehicle statistics
  getVehicleStats: async (): Promise<VehicleStats> => {
    const response = await api.get('/vehicles/stats')
    return response.data.stats
  },
}

export default vehicleService
