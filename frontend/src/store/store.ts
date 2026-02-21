import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import authReducer from './slices/authSlice'
import vehicleReducer from './slices/vehicleSlice'
import driverReducer from './slices/driverSlice'
import tripReducer from './slices/tripSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    drivers: driverReducer,
    trips: tripReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
