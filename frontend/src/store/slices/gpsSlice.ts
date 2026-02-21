import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import apiService from '../services/api'

export interface GPSLocation {
  id: number
  vehicleId: number
  tripId?: number
  latitude: number
  longitude: number
  altitude?: number
  accuracy?: number
  speed?: number
  heading?: number
  source: 'mobile_app' | 'gps_device' | 'manual'
  isGeofenceComplete?: boolean
  geofenceId?: string
  idleStartTime?: Date
  isIdle?: boolean
  timestamp: string | Date
  createdAt: string
  updatedAt: string
}

export interface RouteStatistics {
  totalDistance: number
  averageSpeed: number
  maxSpeed: number
  tripDuration: number
  pointCount: number
  startTime: string | Date
  endTime: string | Date
}

export interface IdleSession {
  startTime: string | Date
  endTime: string | Date
  startLocation: { latitude: number; longitude: number }
  endLocation: { latitude: number; longitude: number }
  duration: number
}

export interface SpeedingEvent {
  speedLimit: number
  violations: GPSLocation[]
  totalViolations: number
  averageExcessSpeed: number
}

export interface VehicleLiveStatus {
  id: number
  registrationNumber: string
  vehicleType: string
  status: string
  currentLocation: GPSLocation | null
}

export interface GPSState {
  currentLocations: Map<number, GPSLocation>
  locationHistory: GPSLocation[]
  tripRoute: {
    waypoints: GPSLocation[]
    statistics: RouteStatistics
  } | null
  idleSessions: IdleSession[]
  speedingEvents: SpeedingEvent | null
  liveVehicles: VehicleLiveStatus[]
  activeVehicleId: number | null
  activeTripId: number | null
  loading: boolean
  error: string | null
  lastUpdate: Date | null
}

const initialState: GPSState = {
  currentLocations: new Map(),
  locationHistory: [],
  tripRoute: null,
  idleSessions: [],
  speedingEvents: null,
  liveVehicles: [],
  activeVehicleId: null,
  activeTripId: null,
  loading: false,
  error: null,
  lastUpdate: null
}

// Async thunks
export const recordGPSLocation = createAsyncThunk(
  'gps/recordLocation',
  async (
    locationData: {
      vehicleId: number
      latitude: number
      longitude: number
      tripId?: number
      speed?: number
      heading?: number
      accuracy?: number
      altitude?: number
      source?: string
      geofenceId?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.post('/gps/locations', locationData)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record location')
    }
  }
)

export const fetchCurrentLocation = createAsyncThunk(
  'gps/fetchCurrentLocation',
  async (vehicleId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/gps/vehicles/${vehicleId}/current`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch current location')
    }
  }
)

export const fetchLocationHistory = createAsyncThunk(
  'gps/fetchLocationHistory',
  async (
    params: {
      vehicleId: number
      tripId?: number
      startDate?: string
      endDate?: string
      limit?: number
      offset?: number
    },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.tripId) queryParams.append('tripId', params.tripId.toString())
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())

      const response = await apiService.get(
        `/gps/vehicles/${params.vehicleId}/history?${queryParams.toString()}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch location history')
    }
  }
)

export const fetchTripRoute = createAsyncThunk(
  'gps/fetchTripRoute',
  async (tripId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/gps/trips/${tripId}/route`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trip route')
    }
  }
)

export const fetchIdleSessions = createAsyncThunk(
  'gps/fetchIdleSessions',
  async (
    params: {
      vehicleId: number
      startDate?: string
      endDate?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)

      const response = await apiService.get(
        `/gps/vehicles/${params.vehicleId}/idle-sessions?${queryParams.toString()}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch idle sessions')
    }
  }
)

export const fetchSpeedingEvents = createAsyncThunk(
  'gps/fetchSpeedingEvents',
  async (
    params: {
      vehicleId: number
      speedLimit?: number
      startDate?: string
      endDate?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.speedLimit) queryParams.append('speedLimit', params.speedLimit.toString())
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)

      const response = await apiService.get(
        `/gps/vehicles/${params.vehicleId}/speeding-events?${queryParams.toString()}`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch speeding events')
    }
  }
)

export const fetchAllVehiclesLiveStatus = createAsyncThunk(
  'gps/fetchAllVehiclesLiveStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/gps/vehicles')
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch live vehicles status')
    }
  }
)

const gpsSlice = createSlice({
  name: 'gps',
  initialState,
  reducers: {
    setActiveVehicleId: (state, action: PayloadAction<number | null>) => {
      state.activeVehicleId = action.payload
    },
    setActiveTripId: (state, action: PayloadAction<number | null>) => {
      state.activeTripId = action.payload
    },
    updateLocationRealtime: (state, action: PayloadAction<GPSLocation>) => {
      const location = action.payload
      state.currentLocations.set(location.vehicleId, location)
      state.lastUpdate = new Date()
    },
    clearError: (state) => {
      state.error = null
    },
    clearLocationHistory: (state) => {
      state.locationHistory = []
    },
    clearTripRoute: (state) => {
      state.tripRoute = null
    }
  },
  extraReducers: (builder) => {
    // Record Location
    builder
      .addCase(recordGPSLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(recordGPSLocation.fulfilled, (state, action) => {
        state.loading = false
        state.currentLocations.set(action.payload.vehicleId, action.payload)
        state.lastUpdate = new Date()
      })
      .addCase(recordGPSLocation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Current Location
    builder
      .addCase(fetchCurrentLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCurrentLocation.fulfilled, (state, action) => {
        state.loading = false
        state.currentLocations.set(action.payload.vehicleId, action.payload)
        state.lastUpdate = new Date()
      })
      .addCase(fetchCurrentLocation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Location History
    builder
      .addCase(fetchLocationHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLocationHistory.fulfilled, (state, action) => {
        state.loading = false
        state.locationHistory = action.payload
        state.lastUpdate = new Date()
      })
      .addCase(fetchLocationHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Trip Route
    builder
      .addCase(fetchTripRoute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTripRoute.fulfilled, (state, action) => {
        state.loading = false
        state.tripRoute = action.payload
        state.lastUpdate = new Date()
      })
      .addCase(fetchTripRoute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Idle Sessions
    builder
      .addCase(fetchIdleSessions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIdleSessions.fulfilled, (state, action) => {
        state.loading = false
        state.idleSessions = action.payload
        state.lastUpdate = new Date()
      })
      .addCase(fetchIdleSessions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Speeding Events
    builder
      .addCase(fetchSpeedingEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSpeedingEvents.fulfilled, (state, action) => {
        state.loading = false
        state.speedingEvents = action.payload
        state.lastUpdate = new Date()
      })
      .addCase(fetchSpeedingEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch All Vehicles Live Status
    builder
      .addCase(fetchAllVehiclesLiveStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllVehiclesLiveStatus.fulfilled, (state, action) => {
        state.loading = false
        state.liveVehicles = action.payload
        action.payload.forEach((vehicle: VehicleLiveStatus) => {
          if (vehicle.currentLocation) {
            state.currentLocations.set(vehicle.id, vehicle.currentLocation)
          }
        })
        state.lastUpdate = new Date()
      })
      .addCase(fetchAllVehiclesLiveStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setActiveVehicleId,
  setActiveTripId,
  updateLocationRealtime,
  clearError,
  clearLocationHistory,
  clearTripRoute
} = gpsSlice.actions

export default gpsSlice.reducer
