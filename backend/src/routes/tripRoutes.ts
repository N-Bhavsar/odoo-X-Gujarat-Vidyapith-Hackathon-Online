import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateTripStatus,
  startTrip,
  completeTrip,
  cancelTrip,
  getTripsByDriver,
  getTripsByVehicle,
  getTripStatistics,
  deleteTrip,
  tripValidationRules
} from '../controllers/tripController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Trip CRUD routes
router.get('/', getAllTrips)
router.get('/statistics', getTripStatistics)
router.get('/:id', getTripById)
router.post('/', tripValidationRules.create, createTrip)
router.put('/:id', tripValidationRules.update, updateTrip)
router.delete('/:id', deleteTrip)

// Trip status management routes
router.patch('/:id/status', tripValidationRules.updateStatus, updateTripStatus)
router.post('/:id/start', startTrip)
router.post('/:id/complete', completeTrip)
router.post('/:id/cancel', cancelTrip)

// Filter routes
router.get('/driver/:driverId', getTripsByDriver)
router.get('/vehicle/:vehicleId', getTripsByVehicle)

export default router
