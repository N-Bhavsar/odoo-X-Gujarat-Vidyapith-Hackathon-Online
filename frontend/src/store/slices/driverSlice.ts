import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface DriverState {
  drivers: any[]
  loading: boolean
  error: string | null
  total: number
}

const initialState: DriverState = {
  drivers: [],
  loading: false,
  error: null,
  total: 0,
}

const driverSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    fetchDriversStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchDriversSuccess: (state, action: PayloadAction<{ drivers: any[], total: number }>) => {
      state.loading = false
      state.drivers = action.payload.drivers
      state.total = action.payload.total
    },
    fetchDriversError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { fetchDriversStart, fetchDriversSuccess, fetchDriversError, clearError } = driverSlice.actions
export default driverSlice.reducer
