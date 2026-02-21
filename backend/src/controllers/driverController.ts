import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import Driver, { DriverStatus, LicenseClass } from '../models/Driver'
import { AuthRequest } from '../middleware/auth'
import { Op } from 'sequelize'

// Validation rules
export const driverValidationRules = {
  create: [
    body('userId').isInt().withMessage('User ID must be an integer'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
    body('licenseClass').isIn(Object.values(LicenseClass)).withMessage('Valid license class is required'),
    body('licenseExpiryDate').isISO8601().withMessage('Valid license expiry date is required'),
    body('status').optional().isIn(Object.values(DriverStatus)).withMessage('Valid status is required')
  ],
  update: [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('phone').optional().trim().notEmpty(),
    body('licenseNumber').optional().trim().notEmpty(),
    body('licenseClass').optional().isIn(Object.values(LicenseClass)),
    body('licenseExpiryDate').optional().isISO8601(),
    body('status').optional().isIn(Object.values(DriverStatus))
  ],
  updateStatus: [
    body('status').isIn(Object.values(DriverStatus)).withMessage('Valid status is required')
  ],
  updateSafetyScore: [
    body('safetyScore').isFloat({ min: 0, max: 5 }).withMessage('Safety score must be between 0 and 5')
  ]
}

// Get all drivers
export const getAllDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10, includeExpiring = false } = req.query

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { licenseNumber: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ]
    }

    // Filter for licenses expiring in 30 days
    if (includeExpiring === 'true') {
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      
      where.licenseExpiryDate = {
        [Op.lte]: futureDate,
        [Op.gte]: today
      }
    }

    const offset = (Number(page) - 1) * Number(limit)

    const { count, rows: drivers } = await Driver.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: ['userId'] // Hide internal user ID if needed
      }
    })

    res.json({
      drivers,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    res.status(500).json({ message: 'Error fetching drivers' })
  }
}

// Get driver by ID
export const getDriverById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const driver = await Driver.findByPk(id)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    res.json(driver)
  } catch (error) {
    console.error('Error fetching driver:', error)
    res.status(500).json({ message: 'Error fetching driver' })
  }
}

// Create new driver
export const createDriver = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { userId, firstName, lastName, email, phone, licenseNumber, licenseClass, licenseExpiryDate, status } = req.body

    // Check if driver already exists with same license number
    const existingDriver = await Driver.findOne({
      where: { licenseNumber }
    })

    if (existingDriver) {
      return res.status(409).json({ message: 'Driver with this license number already exists' })
    }

    const driver = await Driver.create({
      userId,
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      licenseClass,
      licenseExpiryDate,
      status: status || DriverStatus.ACTIVE,
      safetyScore: 5.0,
      totalTrips: 0,
      completedTrips: 0,
      cancelledTrips: 0,
      isActive: true
    })

    res.status(201).json({
      message: 'Driver created successfully',
      driver
    })
  } catch (error) {
    console.error('Error creating driver:', error)
    res.status(500).json({ message: 'Error creating driver' })
  }
}

// Update driver
export const updateDriver = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params

    const driver = await Driver.findByPk(id)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    const updateData = req.body

    // Check for unique constraints if updating email or license number
    if (updateData.email && updateData.email !== driver.email) {
      const existingDriver = await Driver.findOne({ where: { email: updateData.email } })
      if (existingDriver) {
        return res.status(409).json({ message: 'Email already in use' })
      }
    }

    if (updateData.licenseNumber && updateData.licenseNumber !== driver.licenseNumber) {
      const existingDriver = await Driver.findOne({ where: { licenseNumber: updateData.licenseNumber } })
      if (existingDriver) {
        return res.status(409).json({ message: 'License number already in use' })
      }
    }

    await driver.update(updateData)

    res.json({
      message: 'Driver updated successfully',
      driver
    })
  } catch (error) {
    console.error('Error updating driver:', error)
    res.status(500).json({ message: 'Error updating driver' })
  }
}

// Update driver status
export const updateDriverStatus = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { status } = req.body

    const driver = await Driver.findByPk(id)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    await driver.update({ status })

    res.json({
      message: 'Driver status updated successfully',
      driver
    })
  } catch (error) {
    console.error('Error updating driver status:', error)
    res.status(500).json({ message: 'Error updating driver status' })
  }
}

// Update driver safety score
export const updateSafetyScore = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const { safetyScore, reason } = req.body

    const driver = await Driver.findByPk(id)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    // Safety score cannot exceed 5.0
    const newScore = Math.min(5.0, Math.max(0, safetyScore))

    await driver.update({ safetyScore: newScore })

    res.json({
      message: 'Safety score updated successfully',
      driver
    })
  } catch (error) {
    console.error('Error updating safety score:', error)
    res.status(500).json({ message: 'Error updating safety score' })
  }
}

// Delete driver (soft delete by marking inactive)
export const deleteDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const driver = await Driver.findByPk(id)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    await driver.update({ isActive: false, status: DriverStatus.INACTIVE })

    res.json({
      message: 'Driver deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting driver:', error)
    res.status(500).json({ message: 'Error deleting driver' })
  }
}

// Check driver license expiry
export const checkLicenseExpiry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const driver = await Driver.findByPk(id)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    const isExpired = driver.isLicenseExpired()
    const expiringIn30Days = driver.getLicenseExpiringInDays(30)
    const expiringIn7Days = driver.getLicenseExpiringInDays(7)

    res.json({
      driverId: id,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      isExpired,
      expiringIn30Days,
      expiringIn7Days,
      daysUntilExpiry: Math.ceil((new Date(driver.licenseExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    })
  } catch (error) {
    console.error('Error checking license expiry:', error)
    res.status(500).json({ message: 'Error checking license expiry' })
  }
}

// Get drivers with expiring licenses
export const getExpiringLicenses = async (req: AuthRequest, res: Response) => {
  try {
    const { daysThreshold = 30 } = req.query

    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + Number(daysThreshold))

    const drivers = await Driver.findAll({
      where: {
        licenseExpiryDate: {
          [Op.lte]: futureDate,
          [Op.gte]: today
        },
        isActive: true
      },
      order: [['licenseExpiryDate', 'ASC']]
    })

    res.json({
      count: drivers.length,
      daysThreshold: Number(daysThreshold),
      drivers: drivers.map(d => ({
        id: d.id,
        fullName: d.getFullName(),
        licenseNumber: d.licenseNumber,
        licenseClass: d.licenseClass,
        licenseExpiryDate: d.licenseExpiryDate,
        daysUntilExpiry: Math.ceil((new Date(d.licenseExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))
    })
  } catch (error) {
    console.error('Error fetching drivers with expiring licenses:', error)
    res.status(500).json({ message: 'Error fetching drivers with expiring licenses' })
  }
}

// Get driver performance metrics
export const getDriverMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const driver = await Driver.findByPk(id)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    res.json({
      id: driver.id,
      fullName: driver.getFullName(),
      safetyScore: driver.safetyScore,
      totalTrips: driver.totalTrips,
      completedTrips: driver.completedTrips,
      cancelledTrips: driver.cancelledTrips,
      completionRate: driver.getCompletionRate(),
      cancellationRate: driver.totalTrips > 0 ? Math.round((driver.cancelledTrips / driver.totalTrips) * 100) : 0,
      averageRating: driver.safetyScore
    })
  } catch (error) {
    console.error('Error fetching driver metrics:', error)
    res.status(500).json({ message: 'Error fetching driver metrics' })
  }
}

// Increment trip counters
export const incrementTripCounter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { type = 'total' } = req.body // Type: 'total', 'completed', 'cancelled'

    const driver = await Driver.findByPk(id)

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' })
    }

    const updates: any = {}

    switch (type) {
      case 'completed':
        updates.completedTrips = driver.completedTrips + 1
        updates.totalTrips = driver.totalTrips + 1
        break
      case 'cancelled':
        updates.cancelledTrips = driver.cancelledTrips + 1
        updates.totalTrips = driver.totalTrips + 1
        break
      default:
        updates.totalTrips = driver.totalTrips + 1
    }

    await driver.update(updates)

    res.json({
      message: 'Trip counter updated successfully',
      driver
    })
  } catch (error) {
    console.error('Error incrementing trip counter:', error)
    res.status(500).json({ message: 'Error incrementing trip counter' })
  }
}
