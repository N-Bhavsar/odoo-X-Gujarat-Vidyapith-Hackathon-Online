import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { authenticate } from '../middleware/auth'
import {
  recordLocation,
  getCurrentLocation,
  getLocationHistory,
  getTripRoute,
  getIdleSessions,
  getSpeedingEvents,
  getAllVehiclesLiveStatus,
  deleteOldLocations
} from '../controllers/gpsController'

const router = Router()

// Middleware
router.use(authenticate)

/**
 * POST /api/gps/locations
 * Record a new GPS location update
 * Access: Authenticated users
 */
router.post(
  '/locations',
  [
    body('vehicleId').isInt().notEmpty(),
    body('latitude').isFloat({ min: -90, max: 90 }).notEmpty(),
    body('longitude').isFloat({ min: -180, max: 180 }).notEmpty(),
    body('tripId').isInt().optional(),
    body('altitude').isFloat().optional(),
    body('accuracy').isFloat().optional(),
    body('speed').isFloat().optional(),
    body('heading').isFloat({ min: 0, max: 360 }).optional(),
    body('source').isIn(['mobile_app', 'gps_device', 'manual']).optional(),
    body('geofenceId').isString().optional()
  ],
  recordLocation
)

/**
 * GET /api/gps/vehicles/:vehicleId/current
 * Get the most recent location of a vehicle
 * Access: Authenticated users
 */
router.get(
  '/vehicles/:vehicleId/current',
  [param('vehicleId').isInt()],
  getCurrentLocation
)

/**
 * GET /api/gps/vehicles/:vehicleId/history
 * Get location history for a vehicle with optional filtering
 * Query: tripId, startDate, endDate, limit, offset
 * Access: Authenticated users
 */
router.get(
  '/vehicles/:vehicleId/history',
  [param('vehicleId').isInt(), query('limit').isInt({ max: 5000 }).optional(), query('offset').isInt().optional()],
  getLocationHistory
)

/**
 * GET /api/gps/trips/:tripId/route
 * Get the complete route with waypoints for a trip
 * Access: Authenticated users
 */
router.get('/trips/:tripId/route', [param('tripId').isInt()], getTripRoute)

/**
 * GET /api/gps/vehicles/:vehicleId/idle-sessions
 * Get idle time tracking data for a vehicle
 * Query: startDate, endDate
 * Access: Authenticated users
 */
router.get(
  '/vehicles/:vehicleId/idle-sessions',
  [param('vehicleId').isInt()],
  getIdleSessions
)

/**
 * GET /api/gps/vehicles/:vehicleId/speeding-events
 * Get speeding violations for a vehicle
 * Query: speedLimit, startDate, endDate
 * Access: Authenticated users
 */
router.get(
  '/vehicles/:vehicleId/speeding-events',
  [param('vehicleId').isInt(), query('speedLimit').isInt().optional()],
  getSpeedingEvents
)

/**
 * GET /api/gps/vehicles
 * Get live status of all vehicles with their current locations
 * Access: Authenticated users
 */
router.get('/vehicles', getAllVehiclesLiveStatus)

/**
 * DELETE /api/gps/locations
 * Delete GPS records older than specified days (cleanup)
 * Body: daysOld
 * Access: Admin only (requires role check)
 */
router.delete(
  '/locations',
  [body('daysOld').isInt({ min: 1 }).optional()],
  deleteOldLocations
)

export default router
