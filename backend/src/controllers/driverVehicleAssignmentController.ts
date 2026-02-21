import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import DriverVehicleAssignment from '../models/DriverVehicleAssignment'
import Driver, { LicenseClass } from '../models/Driver'
import Vehicle, { VehicleType } from '../models/Vehicle'
import { AuthRequest } from '../middleware/auth'
import { Op } from 'sequelize'

// Validation rules
export const assignmentValidationRules = {
  create: [
    body('driverId').isInt().withMessage('Driver ID must be an integer'),
    body('vehicleId').isInt().withMessage('Vehicle ID must be an integer'),
    body('notes').optional().trim()
  ],
  update: [
    body('notes').optional().trim()
  ]
}

// License and vehicle type compatibility mapping
const licenseVehicleCompatibility: { [key in LicenseClass]: VehicleType[] } = {
  [LicenseClass.A]: [VehicleType.MOTORCYCLE],
  [LicenseClass.B]: [VehicleType.SEDAN, VehicleType.SUV, VehicleType.VAN],
  [LicenseClass.C]: [VehicleType.TRUCK, VehicleType.VAN],
  [LicenseClass.D]: [VehicleType.BUS],
  [LicenseClass.BE]: [VehicleType.SEDAN, VehicleType.SUV, VehicleType.VAN],
  [LicenseClass.CE]: [VehicleType.TRUCK, VehicleType.VAN, VehicleType.BUS]
}

// Helper function to check license-vehicle compatibility
const isLicenseCompatibleWithVehicle = (licenseClass: LicenseClass, vehicleType: VehicleType): boolean => {
  const compatibleTypes = licenseVehicleCompatibility[licenseClass]
  return compatibleTypes ? compatibleTypes.includes(vehicleType) : false
}

// Get all active assignments
export const getActiveAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { driverId, vehicleId, page = 1, limit = 10 } = req.query

    const where: any = { isActive: true }

    if (driverId) {
      where.driverId = driverId
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    const offset = (Number(page) - 1) * Number(limit)

    const { count, rows: assignments } = await DriverVehicleAssignment.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['assignedDate', 'DESC']]
    })

    res.json({
      assignments,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    res.status(500).json({ message: 'Error fetching assignments' })
  }
}

// Get driver's current vehicle assignment
export const getDriverCurrentAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { driverId } = req.params

    const assignment = await DriverVehicleAssignment.findOne({
      where: {
        driverId,
        isActive: true,
        unassignedDate: null
      }
    })

    if (!assignment) {
      return res.status(404).json({ message: 'No active assignment found for this driver' })
    }

    res.json(assignment)
  } catch (error) {
    console.error('Error fetching driver assignment:', error)
    res.status(500).json({ message: 'Error fetching driver assignment' })
  }
}

// Get vehicle's assigned drivers
export const getVehicleAssignedDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId } = req.params
    const { includeHistory = false } = req.query

    const where: any = { vehicleId }

    if (includeHistory !== 'true') {
      where.isActive = true
      where.unassignedDate = null
    }

    const assignments = await DriverVehicleAssignment.findAll({
      where,
      order: [['assignedDate', 'DESC']]
    })

    res.json({
      vehicleId,
      assignmentCount: assignments.length,
      assignments
    })
  } catch (error) {
    console.error('Error fetching vehicle drivers:', error)
    res.status(500).json({ message: 'Error fetching vehicle drivers' })
  }
}

// Validate and assign driver to vehicle
export const assignDriverToVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { driverId, vehicleId, notes } = req.body

    // Check if driver exists
    const driver = await Driver.findByPk(driverId)
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findByPk(vehicleId)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // Validation 1: Check if driver's license is expired
    if (driver.isLicenseExpired()) {
      return res.status(400).json({
        message: 'Cannot assign driver with expired license',
        licenseExpiryDate: driver.licenseExpiryDate
      })
    }

    // Validation 2: Check if driver's license is compatible with vehicle type
    if (!isLicenseCompatibleWithVehicle(driver.licenseClass, vehicle.type)) {
      return res.status(400).json({
        message: 'Driver license class is not compatible with vehicle type',
        driverLicenseClass: driver.licenseClass,
        vehicleType: vehicle.type,
        compatibleTypes: licenseVehicleCompatibility[driver.licenseClass]
      })
    }

    // Validation 3: Check if driver already has an active assignment
    const existingAssignment = await DriverVehicleAssignment.findOne({
      where: {
        driverId,
        isActive: true,
        unassignedDate: null
      }
    })

    if (existingAssignment) {
      return res.status(409).json({
        message: 'Driver already has an active vehicle assignment',
        currentAssignment: existingAssignment
      })
    }

    // Validation 4: Check if vehicle already has an active assignment
    const vehicleAssignment = await DriverVehicleAssignment.findOne({
      where: {
        vehicleId,
        isActive: true,
        unassignedDate: null
      }
    })

    if (vehicleAssignment) {
      return res.status(409).json({
        message: 'Vehicle already has an active driver assignment',
        currentAssignment: vehicleAssignment
      })
    }

    // Create the assignment
    const assignment = await DriverVehicleAssignment.create({
      driverId,
      vehicleId,
      assignedDate: new Date(),
      isActive: true,
      notes
    })

    res.status(201).json({
      message: 'Driver successfully assigned to vehicle',
      assignment
    })
  } catch (error) {
    console.error('Error assigning driver:', error)
    res.status(500).json({ message: 'Error assigning driver to vehicle' })
  }
}

// Unassign driver from vehicle
export const unassignDriverFromVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params
    const { reason } = req.body

    const assignment = await DriverVehicleAssignment.findByPk(assignmentId)

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' })
    }

    if (!assignment.isActive) {
      return res.status(400).json({ message: 'This assignment is already inactive' })
    }

    // Update assignment
    await assignment.update({
      isActive: false,
      unassignedDate: new Date(),
      notes: reason ? `${assignment.notes || ''} | Unassigned: ${reason}` : assignment.notes
    })

    res.json({
      message: 'Driver successfully unassigned from vehicle',
      assignment
    })
  } catch (error) {
    console.error('Error unassigning driver:', error)
    res.status(500).json({ message: 'Error unassigning driver from vehicle' })
  }
}

// Get assignment history for a driver
export const getDriverAssignmentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { driverId } = req.params

    const assignments = await DriverVehicleAssignment.findAll({
      where: { driverId },
      order: [['assignedDate', 'DESC']]
    })

    res.json({
      driverId,
      assignmentCount: assignments.length,
      assignments: assignments.map(a => ({
        ...a.toJSON(),
        durationInDays: a.getDurationInDays()
      }))
    })
  } catch (error) {
    console.error('Error fetching driver assignment history:', error)
    res.status(500).json({ message: 'Error fetching driver assignment history' })
  }
}

// Get assignment history for a vehicle
export const getVehicleAssignmentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId } = req.params

    const assignments = await DriverVehicleAssignment.findAll({
      where: { vehicleId },
      order: [['assignedDate', 'DESC']]
    })

    res.json({
      vehicleId,
      assignmentCount: assignments.length,
      assignments: assignments.map(a => ({
        ...a.toJSON(),
        durationInDays: a.getDurationInDays()
      }))
    })
  } catch (error) {
    console.error('Error fetching vehicle assignment history:', error)
    res.status(500).json({ message: 'Error fetching vehicle assignment history' })
  }
}

// Validate driver-vehicle compatibility
export const validateCompatibility = async (req: AuthRequest, res: Response) => {
  try {
    const { driverId, vehicleId } = req.body

    // Check if driver exists
    const driver = await Driver.findByPk(driverId)
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findByPk(vehicleId)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    const validationResults = {
      driverId,
      vehicleId,
      driverName: driver.getFullName(),
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      checks: {
        licenseNotExpired: !driver.isLicenseExpired(),
        licenseCompatible: isLicenseCompatibleWithVehicle(driver.licenseClass, vehicle.type),
        noActiveAssignment: !(await DriverVehicleAssignment.findOne({
          where: {
            driverId,
            isActive: true,
            unassignedDate: null
          }
        }))
      },
      issues: []
    }

    if (!validationResults.checks.licenseNotExpired) {
      validationResults.issues.push({
        type: 'EXPIRED_LICENSE',
        message: 'Driver license is expired',
        expiryDate: driver.licenseExpiryDate
      })
    }

    if (!validationResults.checks.licenseCompatible) {
      validationResults.issues.push({
        type: 'LICENSE_INCOMPATIBLE',
        message: 'Driver license is not compatible with vehicle type',
        driverLicenseClass: driver.licenseClass,
        vehicleType: vehicle.type,
        compatibleVehicleTypes: licenseVehicleCompatibility[driver.licenseClass]
      })
    }

    if (!validationResults.checks.noActiveAssignment) {
      validationResults.issues.push({
        type: 'ACTIVE_ASSIGNMENT_EXISTS',
        message: 'Driver already has an active vehicle assignment'
      })
    }

    const isCompatible = validationResults.issues.length === 0

    res.json({
      isCompatible,
      ...validationResults
    })
  } catch (error) {
    console.error('Error validating compatibility:', error)
    res.status(500).json({ message: 'Error validating driver-vehicle compatibility' })
  }
}
