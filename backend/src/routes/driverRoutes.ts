import express from 'express'
import { authenticate } from '../middleware/auth'
import {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  updateDriverStatus,
  updateSafetyScore,
  deleteDriver,
  checkLicenseExpiry,
  getExpiringLicenses,
  getDriverMetrics,
  incrementTripCounter,
  driverValidationRules
} from '../controllers/driverController'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get all drivers
router.get('/', getAllDrivers)

// Get drivers with expiring licenses
router.get('/expiring/licenses', getExpiringLicenses)

// Get driver by ID
router.get('/:id', getDriverById)

// Get driver metrics
router.get('/:id/metrics', getDriverMetrics)

// Check license expiry for specific driver
router.get('/:id/license/check', checkLicenseExpiry)

// Create new driver
router.post('/', driverValidationRules.create, createDriver)

// Update driver
router.put('/:id', driverValidationRules.update, updateDriver)

// Update driver status
router.patch('/:id/status', driverValidationRules.updateStatus, updateDriverStatus)

// Update driver safety score
router.patch('/:id/safety-score', driverValidationRules.updateSafetyScore, updateSafetyScore)

// Increment trip counter
router.patch('/:id/trips', incrementTripCounter)

// Delete driver (soft delete)
router.delete('/:id', deleteDriver)

export default router
