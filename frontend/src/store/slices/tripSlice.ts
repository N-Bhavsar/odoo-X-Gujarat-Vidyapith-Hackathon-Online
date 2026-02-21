import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Trip {
  id: number
  vehicleId: number
  driverId: number
  origin: string
  destination: string
  scheduledDeparture: string
  scheduledArrival?: string
  actualDeparture?: string
  actualArrival?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  distanceKm?: number
  cargoDescription?: string
  cargoWeightKg?: number
  notes?: string
  createdAt: string
  updatedAt: string
  driver?: {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    licenseNumber: string
    status: string
  }
  vehicle?: {
    id: number
    vehicleNumber: string
    registrationNumber: string
    make: string
    model: string
    type: string
    status: string
  }
}

export interface TripStatistics {
  totalTrips: number
  scheduledTrips: number
  inProgressTrips: number
  completedTrips: number
  cancelledTrips: number
  completionRate: string
  cancellationRate: string
  totalDistanceKm: string
  averageDurationHours: string
}

interface TripState {
  trips: Trip[]
  selectedTrip: Trip | null
  tripStatistics: TripStatistics | null
  loading: boolean
  error: string | null
  totalTrips: number
  currentPage: number
  pageSize: number
}

const initialState: TripState = {
  trips: [],
  selectedTrip: null,
  tripStatistics: null,
  loading: false,
  error: null,
  totalTrips: 0,
  currentPage: 1,
  pageSize: 10
}

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    // Fetch all trips
    fetchTripsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchTripsSuccess: (state, action: PayloadAction<{ trips: Trip[], total: number }>) => {
      state.loading = false
      state.trips = action.payload.trips
      state.totalTrips = action.payload.total
    },
    fetchTripsError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Fetch single trip
    fetchTripStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchTripSuccess: (state, action: PayloadAction<Trip>) => {
      state.loading = false
      state.selectedTrip = action.payload
    },
    fetchTripError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Fetch trip statistics
    fetchTripStatisticsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchTripStatisticsSuccess: (state, action: PayloadAction<TripStatistics>) => {
      state.loading = false
      state.tripStatistics = action.payload
    },
    fetchTripStatisticsError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Create trip
    createTripStart: (state) => {
      state.loading = true
      state.error = null
    },
    createTripSuccess: (state, action: PayloadAction<Trip>) => {
      state.loading = false
      state.trips.unshift(action.payload)
      state.totalTrips += 1
    },
    createTripError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Update trip
    updateTripStart: (state) => {
      state.loading = true
      state.error = null
    },
    updateTripSuccess: (state, action: PayloadAction<Trip>) => {
      state.loading = false
      const index = state.trips.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.trips[index] = action.payload
      }
      if (state.selectedTrip?.id === action.payload.id) {
        state.selectedTrip = action.payload
      }
    },
    updateTripError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Update trip status
    updateTripStatusStart: (state) => {
      state.loading = true
      state.error = null
    },
    updateTripStatusSuccess: (state, action: PayloadAction<Trip>) => {
      state.loading = false
      const index = state.trips.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.trips[index] = action.payload
      }
      if (state.selectedTrip?.id === action.payload.id) {
        state.selectedTrip = action.payload
      }
    },
    updateTripStatusError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Delete trip
    deleteTripStart: (state) => {
      state.loading = true
      state.error = null
    },
    deleteTripSuccess: (state, action: PayloadAction<number>) => {
      state.loading = false
      state.trips = state.trips.filter((t) => t.id !== action.payload)
      state.totalTrips -= 1
      if (state.selectedTrip?.id === action.payload) {
        state.selectedTrip = null
      }
    },
    deleteTripError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },

    // Utility
    clearError: (state) => {
      state.error = null
    },
    clearSelectedTrip: (state) => {
      state.selectedTrip = null
    }
  }
})

export const {
  fetchTripsStart,
  fetchTripsSuccess,
  fetchTripsError,
  fetchTripStart,
  fetchTripSuccess,
  fetchTripError,
  fetchTripStatisticsStart,
  fetchTripStatisticsSuccess,
  fetchTripStatisticsError,
  createTripStart,
  createTripSuccess,
  createTripError,
  updateTripStart,
  updateTripSuccess,
  updateTripError,
  updateTripStatusStart,
  updateTripStatusSuccess,
  updateTripStatusError,
  deleteTripStart,
  deleteTripSuccess,
  deleteTripError,
  setCurrentPage,
  clearError,
  clearSelectedTrip
} = tripSlice.actions

export default tripSlice.reducer
