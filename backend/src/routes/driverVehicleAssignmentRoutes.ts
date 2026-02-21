import express from 'express'
import { authenticate } from '../middleware/auth'
import {
  getActiveAssignments,
  getDriverCurrentAssignment,
  getVehicleAssignedDrivers,
  assignDriverToVehicle,
  unassignDriverFromVehicle,
  getDriverAssignmentHistory,
  getVehicleAssignmentHistory,
  validateCompatibility,
  assignmentValidationRules
} from '../controllers/driverVehicleAssignmentController'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Get all active assignments
router.get('/', getActiveAssignments)

// Get driver's current assignment
router.get('/driver/:driverId', getDriverCurrentAssignment)

// Get driver's assignment history
router.get('/driver/history/:driverId', getDriverAssignmentHistory)

// Get vehicle's assigned drivers
router.get('/vehicle/:vehicleId', getVehicleAssignedDrivers)

// Get vehicle's assignment history
router.get('/vehicle/history/:vehicleId', getVehicleAssignmentHistory)

// Validate driver-vehicle compatibility
router.post('/validate', validateCompatibility)

// Assign driver to vehicle
router.post('/', assignmentValidationRules.create, assignDriverToVehicle)

// Unassign driver from vehicle
router.delete('/:assignmentId', unassignDriverFromVehicle)

export default router
