import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import VehiclesPage from './pages/VehiclesPage'
import VehicleFormPage from './pages/VehicleFormPage'
import VehicleDetailsPage from './pages/VehicleDetailsPage'
import TripDispatcher from './pages/TripDispatcher'
import MaintenanceLogs from './pages/MaintenanceLogs'
import ExpenseTracking from './pages/ExpenseTracking'
import DriverProfiles from './pages/DriverProfiles'
import Analytics from './pages/Analytics'
import GPSTracking from './pages/GPSTracking'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
        <Route path="/vehicles/new" element={<ProtectedRoute><VehicleFormPage /></ProtectedRoute>} />
        <Route path="/vehicles/:id/edit" element={<ProtectedRoute><VehicleFormPage /></ProtectedRoute>} />
        <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetailsPage /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><TripDispatcher /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenanceLogs /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><ExpenseTracking /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><DriverProfiles /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/gps" element={<ProtectedRoute><GPSTracking /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
