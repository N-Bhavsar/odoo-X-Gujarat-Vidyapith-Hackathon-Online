import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import vehicleService, { Vehicle, VehicleFilters, VehicleStats } from '../../services/vehicleService'

interface VehicleState {
  vehicles: Vehicle[]
  currentVehicle: Vehicle | null
  stats: VehicleStats | null
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  filters: VehicleFilters
}

const initialState: VehicleState = {
  vehicles: [],
  currentVehicle: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 10,
  },
}

// Async thunks
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (filters: VehicleFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await vehicleService.getVehicles(filters)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles')
    }
  }
)

export const fetchVehicleById = createAsyncThunk(
  'vehicles/fetchVehicleById',
  async (id: number, { rejectWithValue }) => {
    try {
      const vehicle = await vehicleService.getVehicle(id)
      return vehicle
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle')
    }
  }
)

export const createVehicle = createAsyncThunk(
  'vehicles/createVehicle',
  async (vehicleData: Partial<Vehicle>, { rejectWithValue }) => {
    try {
      const vehicle = await vehicleService.createVehicle(vehicleData)
      return vehicle
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create vehicle')
    }
  }
)

export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async ({ id, data }: { id: number; data: Partial<Vehicle> }, { rejectWithValue }) => {
    try {
      const vehicle = await vehicleService.updateVehicle(id, data)
      return vehicle
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update vehicle')
    }
  }
)

export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (id: number, { rejectWithValue }) => {
    try {
      await vehicleService.deleteVehicle(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete vehicle')
    }
  }
)

export const fetchVehicleStats = createAsyncThunk(
  'vehicles/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await vehicleService.getVehicleStats()
      return stats
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle stats')
    }
  }
)

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action: PayloadAction<VehicleFilters>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null
    },
  },
  extraReducers: (builder) => {
    // Fetch vehicles
    builder.addCase(fetchVehicles.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchVehicles.fulfilled, (state, action) => {
      state.loading = false
      state.vehicles = action.payload.vehicles
      state.pagination = action.payload.pagination
    })
    builder.addCase(fetchVehicles.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch vehicle by ID
    builder.addCase(fetchVehicleById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchVehicleById.fulfilled, (state, action) => {
      state.loading = false
      state.currentVehicle = action.payload
    })
    builder.addCase(fetchVehicleById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create vehicle
    builder.addCase(createVehicle.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createVehicle.fulfilled, (state, action) => {
      state.loading = false
      state.vehicles.unshift(action.payload)
    })
    builder.addCase(createVehicle.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update vehicle
    builder.addCase(updateVehicle.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateVehicle.fulfilled, (state, action) => {
      state.loading = false
      const index = state.vehicles.findIndex((v) => v.id === action.payload.id)
      if (index !== -1) {
        state.vehicles[index] = action.payload
      }
      if (state.currentVehicle?.id === action.payload.id) {
        state.currentVehicle = action.payload
      }
    })
    builder.addCase(updateVehicle.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Delete vehicle
    builder.addCase(deleteVehicle.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteVehicle.fulfilled, (state, action) => {
      state.loading = false
      state.vehicles = state.vehicles.filter((v) => v.id !== action.payload)
    })
    builder.addCase(deleteVehicle.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch stats
    builder.addCase(fetchVehicleStats.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchVehicleStats.fulfilled, (state, action) => {
      state.loading = false
      state.stats = action.payload
    })
    builder.addCase(fetchVehicleStats.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { clearError, setFilters, clearCurrentVehicle } = vehicleSlice.actions
export default vehicleSlice.reducer
