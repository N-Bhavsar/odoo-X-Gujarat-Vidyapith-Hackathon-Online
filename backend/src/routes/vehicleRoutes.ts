import express from 'express'
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
  vehicleValidationRules,
} from '../controllers/vehicleController'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get vehicle statistics
router.get('/stats', getVehicleStats)

// Get all vehicles (with filters and pagination)
router.get('/', getAllVehicles)

// Get vehicle by ID
router.get('/:id', getVehicleById)

// Create new vehicle (admin or fleet_manager only)
router.post(
  '/',
  authorize('admin', 'fleet_manager'),
  vehicleValidationRules.create,
  createVehicle
)

// Update vehicle (admin or fleet_manager only)
router.put(
  '/:id',
  authorize('admin', 'fleet_manager'),
  vehicleValidationRules.update,
  updateVehicle
)

// Delete vehicle (admin only)
router.delete('/:id', authorize('admin'), deleteVehicle)

export default router
