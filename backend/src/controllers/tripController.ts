import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import Trip, { TripStatus } from '../models/Trip'
import Driver, { DriverStatus } from '../models/Driver'
import Vehicle, { VehicleStatus } from '../models/Vehicle'
import DriverVehicleAssignment from '../models/DriverVehicleAssignment'
import { AuthRequest } from '../middleware/auth'
import { Op } from 'sequelize'

// Validation rules
export const tripValidationRules = {
  create: [
    body('vehicleId').isInt().withMessage('Vehicle ID must be an integer'),
    body('driverId').isInt().withMessage('Driver ID must be an integer'),
    body('origin').trim().notEmpty().withMessage('Origin is required'),
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    body('scheduledDeparture').isISO8601().withMessage('Valid scheduled departure date is required'),
    body('scheduledArrival').optional().isISO8601().withMessage('Valid scheduled arrival date is required'),
    body('distanceKm').optional().isFloat({ min: 0 }).withMessage('Distance must be a positive number'),
    body('cargoDescription').optional().trim(),
    body('cargoWeightKg').optional().isFloat({ min: 0 }).withMessage('Cargo weight must be a positive number')
  ],
  update: [
    body('origin').optional().trim().notEmpty(),
    body('destination').optional().trim().notEmpty(),
    body('scheduledDeparture').optional().isISO8601(),
    body('scheduledArrival').optional().isISO8601(),
    body('distanceKm').optional().isFloat({ min: 0 }),
    body('cargoDescription').optional().trim(),
    body('cargoWeightKg').optional().isFloat({ min: 0 }),
    body('notes').optional().trim()
  ],
  updateStatus: [
    body('status').isIn(Object.values(TripStatus)).withMessage('Valid status is required')
  ]
}

// Get all trips
export const getAllTrips = async (req: AuthRequest, res: Response) => {
  try {
    const { status, driverId, vehicleId, startDate, endDate, page = 1, limit = 10 } = req.query

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (driverId) {
      where.driverId = Number(driverId)
    }

    if (vehicleId) {
      where.vehicleId = Number(vehicleId)
    }

    if (startDate && endDate) {
      where.scheduledDeparture = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      }
    } else if (startDate) {
      where.scheduledDeparture = {
        [Op.gte]: new Date(startDate as string)
      }
    } else if (endDate) {
      where.scheduledDeparture = {
        [Op.lte]: new Date(endDate as string)
      }
    }

    const offset = (Number(page) - 1) * Number(limit)

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['scheduledDeparture', 'DESC']],
      include: [
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'licenseNumber', 'status']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleNumber', 'registrationNumber', 'make', 'model', 'type', 'status']
        }
      ]
    })

    res.json({
      trips,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching trips:', error)
    res.status(500).json({ message: 'Error fetching trips' })
  }
}

// Get trip by ID
export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const trip = await Trip.findByPk(id, {
      include: [
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'licenseNumber', 'status', 'safetyScore']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleNumber', 'registrationNumber', 'make', 'model', 'type', 'status', 'currentMileage']
        }
      ]
    })

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    res.json(trip)
  } catch (error) {
    console.error('Error fetching trip:', error)
    res.status(500).json({ message: 'Error fetching trip' })
  }
}

// Create new trip
export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      vehicleId,
      driverId,
      origin,
      destination,
      scheduledDeparture,
      scheduledArrival,
      distanceKm,
      cargoDescription,
      cargoWeightKg,
      notes
    } = req.body

    // Validate driver exists and is available
    const driver = await Driver.findByPk(driverId)
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    if (driver.status === DriverStatus.SUSPENDED || driver.status === DriverStatus.INACTIVE) {
      return res.status(400).json({ message: 'Driver is not available for trips' })
    }

    // Check if driver license is expired
    if (driver.isLicenseExpired()) {
      return res.status(400).json({ message: 'Driver license has expired' })
    }

    // Validate vehicle exists and is available
    const vehicle = await Vehicle.findByPk(vehicleId)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    if (vehicle.status !== VehicleStatus.ACTIVE) {
      return res.status(400).json({ message: 'Vehicle is not available for trips' })
    }

    // Check if driver-vehicle assignment exists and is active
    const assignment = await DriverVehicleAssignment.findOne({
      where: {
        driverId,
        vehicleId,
        isActive: true
      }
    })

    if (!assignment) {
      return res.status(400).json({
        message: 'Driver is not assigned to this vehicle. Please create an assignment first.'
      })
    }

    // Check for conflicting trips for driver
    const driverConflict = await Trip.findOne({
      where: {
        driverId,
        status: {
          [Op.in]: [TripStatus.SCHEDULED, TripStatus.IN_PROGRESS]
        },
        [Op.or]: [
          {
            scheduledDeparture: {
              [Op.between]: [scheduledDeparture, scheduledArrival || scheduledDeparture]
            }
          },
          {
            scheduledArrival: {
              [Op.between]: [scheduledDeparture, scheduledArrival || scheduledDeparture]
            }
          }
        ]
      }
    })

    if (driverConflict) {
      return res.status(409).json({
        message: 'Driver already has a conflicting trip scheduled during this time',
        conflictingTripId: driverConflict.id
      })
    }

    // Check for conflicting trips for vehicle
    const vehicleConflict = await Trip.findOne({
      where: {
        vehicleId,
        status: {
          [Op.in]: [TripStatus.SCHEDULED, TripStatus.IN_PROGRESS]
        },
        [Op.or]: [
          {
            scheduledDeparture: {
              [Op.between]: [scheduledDeparture, scheduledArrival || scheduledDeparture]
            }
          },
          {
            scheduledArrival: {
              [Op.between]: [scheduledDeparture, scheduledArrival || scheduledDeparture]
            }
          }
        ]
      }
    })

    if (vehicleConflict) {
      return res.status(409).json({
        message: 'Vehicle already has a conflicting trip scheduled during this time',
        conflictingTripId: vehicleConflict.id
      })
    }

    // Create the trip
    const trip = await Trip.create({
      vehicleId,
      driverId,
      origin,
      destination,
      scheduledDeparture,
      scheduledArrival,
      distanceKm,
      cargoDescription,
      cargoWeightKg,
      notes,
      status: TripStatus.SCHEDULED
    })

    res.status(201).json({
      message: 'Trip created successfully',
      trip
    })
  } catch (error) {
    console.error('Error creating trip:', error)
    res.status(500).json({ message: 'Error creating trip' })
  }
}

// Update trip
export const updateTrip = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const updateData = req.body

    const trip = await Trip.findByPk(id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    // Don't allow updates to completed or cancelled trips
    if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
      return res.status(400).json({ message: 'Cannot update completed or cancelled trips' })
    }

    await trip.update(updateData)

    res.json({
      message: 'Trip updated successfully',
      trip
    })
  } catch (error) {
    console.error('Error updating trip:', error)
    res.status(500).json({ message: 'Error updating trip' })
  }
}

// Update trip status
export const updateTripStatus = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { status } = req.body

    const trip = await Trip.findByPk(id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    // Update status with appropriate timestamps
    const updates: any = { status }

    if (status === TripStatus.IN_PROGRESS && !trip.actualDeparture) {
      updates.actualDeparture = new Date()
      
      // Update driver status to on_trip
      await Driver.update(
        { status: DriverStatus.ON_TRIP },
        { where: { id: trip.driverId } }
      )
    }

    if (status === TripStatus.COMPLETED && !trip.actualArrival) {
      updates.actualArrival = new Date()
      
      // Update driver status back to active and increment trip counters
      const driver = await Driver.findByPk(trip.driverId)
      if (driver) {
        await driver.update({
          status: DriverStatus.ACTIVE,
          totalTrips: driver.totalTrips + 1,
          completedTrips: driver.completedTrips + 1
        })
      }
    }

    if (status === TripStatus.CANCELLED) {
      // Update driver status back to active and increment cancelled counter
      const driver = await Driver.findByPk(trip.driverId)
      if (driver) {
        await driver.update({
          status: DriverStatus.ACTIVE,
          totalTrips: driver.totalTrips + 1,
          cancelledTrips: driver.cancelledTrips + 1
        })
      }
    }

    await trip.update(updates)

    res.json({
      message: 'Trip status updated successfully',
      trip
    })
  } catch (error) {
    console.error('Error updating trip status:', error)
    res.status(500).json({ message: 'Error updating trip status' })
  }
}

// Start trip
export const startTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const trip = await Trip.findByPk(id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    if (trip.status !== TripStatus.SCHEDULED) {
      return res.status(400).json({ message: 'Only scheduled trips can be started' })
    }

    await trip.update({
      status: TripStatus.IN_PROGRESS,
      actualDeparture: new Date()
    })

    // Update driver status
    await Driver.update(
      { status: DriverStatus.ON_TRIP },
      { where: { id: trip.driverId } }
    )

    res.json({
      message: 'Trip started successfully',
      trip
    })
  } catch (error) {
    console.error('Error starting trip:', error)
    res.status(500).json({ message: 'Error starting trip' })
  }
}

// Complete trip
export const completeTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const trip = await Trip.findByPk(id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    if (trip.status !== TripStatus.IN_PROGRESS) {
      return res.status(400).json({ message: 'Only in-progress trips can be completed' })
    }

    await trip.update({
      status: TripStatus.COMPLETED,
      actualArrival: new Date()
    })

    // Update driver status and counters
    const driver = await Driver.findByPk(trip.driverId)
    if (driver) {
      await driver.update({
        status: DriverStatus.ACTIVE,
        totalTrips: driver.totalTrips + 1,
        completedTrips: driver.completedTrips + 1
      })
    }

    res.json({
      message: 'Trip completed successfully',
      trip
    })
  } catch (error) {
    console.error('Error completing trip:', error)
    res.status(500).json({ message: 'Error completing trip' })
  }
}

// Cancel trip
export const cancelTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const trip = await Trip.findByPk(id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    if (trip.status === TripStatus.COMPLETED) {
      return res.status(400).json({ message: 'Cannot cancel a completed trip' })
    }

    if (trip.status === TripStatus.CANCELLED) {
      return res.status(400).json({ message: 'Trip is already cancelled' })
    }

    const updates: any = {
      status: TripStatus.CANCELLED
    }

    if (reason) {
      updates.notes = trip.notes ? `${trip.notes}\n\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`
    }

    await trip.update(updates)

    // Update driver status and counters
    const driver = await Driver.findByPk(trip.driverId)
    if (driver) {
      const driverUpdates: any = {
        totalTrips: driver.totalTrips + 1,
        cancelledTrips: driver.cancelledTrips + 1
      }

      // If driver was on this trip, set them back to active
      if (driver.status === DriverStatus.ON_TRIP) {
        driverUpdates.status = DriverStatus.ACTIVE
      }

      await driver.update(driverUpdates)
    }

    res.json({
      message: 'Trip cancelled successfully',
      trip
    })
  } catch (error) {
    console.error('Error cancelling trip:', error)
    res.status(500).json({ message: 'Error cancelling trip' })
  }
}

// Get trips by driver
export const getTripsByDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { driverId } = req.params
    const { status, page = 1, limit = 10 } = req.query

    const where: any = { driverId: Number(driverId) }

    if (status) {
      where.status = status
    }

    const offset = (Number(page) - 1) * Number(limit)

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['scheduledDeparture', 'DESC']],
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleNumber', 'registrationNumber', 'make', 'model', 'type']
        }
      ]
    })

    res.json({
      trips,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching driver trips:', error)
    res.status(500).json({ message: 'Error fetching driver trips' })
  }
}

// Get trips by vehicle
export const getTripsByVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId } = req.params
    const { status, page = 1, limit = 10 } = req.query

    const where: any = { vehicleId: Number(vehicleId) }

    if (status) {
      where.status = status
    }

    const offset = (Number(page) - 1) * Number(limit)

    const { count, rows: trips } = await Trip.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['scheduledDeparture', 'DESC']],
      include: [
        {
          model: Driver,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'licenseNumber']
        }
      ]
    })

    res.json({
      trips,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching vehicle trips:', error)
    res.status(500).json({ message: 'Error fetching vehicle trips' })
  }
}

// Get trip statistics
export const getTripStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    const where: any = {}

    if (startDate && endDate) {
      where.scheduledDeparture = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      }
    }

    const totalTrips = await Trip.count({ where })
    const scheduledTrips = await Trip.count({ where: { ...where, status: TripStatus.SCHEDULED } })
    const inProgressTrips = await Trip.count({ where: { ...where, status: TripStatus.IN_PROGRESS } })
    const completedTrips = await Trip.count({ where: { ...where, status: TripStatus.COMPLETED } })
    const cancelledTrips = await Trip.count({ where: { ...where, status: TripStatus.CANCELLED } })

    // Calculate total distance
    const trips = await Trip.findAll({
      where: { ...where, status: TripStatus.COMPLETED },
      attributes: ['distanceKm']
    })

    const totalDistance = trips.reduce((sum, trip) => sum + (Number(trip.distanceKm) || 0), 0)

    // Calculate average trip duration for completed trips
    const completedTripsWithDuration = await Trip.findAll({
      where: { ...where, status: TripStatus.COMPLETED },
      attributes: ['actualDeparture', 'actualArrival']
    })

    let totalDuration = 0
    let tripsWithDuration = 0

    completedTripsWithDuration.forEach((trip) => {
      const duration = trip.getTripDurationHours()
      if (duration) {
        totalDuration += duration
        tripsWithDuration++
      }
    })

    const averageDuration = tripsWithDuration > 0 ? totalDuration / tripsWithDuration : 0

    res.json({
      totalTrips,
      scheduledTrips,
      inProgressTrips,
      completedTrips,
      cancelledTrips,
      completionRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 0,
      cancellationRate: totalTrips > 0 ? ((cancelledTrips / totalTrips) * 100).toFixed(2) : 0,
      totalDistanceKm: totalDistance.toFixed(2),
      averageDurationHours: averageDuration.toFixed(2)
    })
  } catch (error) {
    console.error('Error fetching trip statistics:', error)
    res.status(500).json({ message: 'Error fetching trip statistics' })
  }
}

// Delete trip (soft delete)
export const deleteTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const trip = await Trip.findByPk(id)

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    // Only allow deletion of scheduled trips
    if (trip.status !== TripStatus.SCHEDULED) {
      return res.status(400).json({ message: 'Only scheduled trips can be deleted' })
    }

    await trip.destroy()

    res.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    res.status(500).json({ message: 'Error deleting trip' })
  }
}
