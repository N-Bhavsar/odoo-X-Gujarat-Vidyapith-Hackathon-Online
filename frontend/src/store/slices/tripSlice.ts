import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  trips: [],
  loading: false,
  error: null,
}

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {},
})

export default tripSlice.reducer
