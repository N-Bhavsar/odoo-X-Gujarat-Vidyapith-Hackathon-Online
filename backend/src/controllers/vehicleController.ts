import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import Vehicle, { VehicleStatus, VehicleType, FuelType } from '../models/Vehicle'
import { AuthRequest } from '../middleware/auth'

// Validation rules
export const vehicleValidationRules = {
  create: [
    body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
    body('make').trim().notEmpty().withMessage('Make is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: 2100 }).withMessage('Valid year is required'),
    body('type').isIn(Object.values(VehicleType)).withMessage('Valid vehicle type is required'),
    body('fuelType').isIn(Object.values(FuelType)).withMessage('Valid fuel type is required'),
    body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
    body('vin').optional().trim().isLength({ min: 17, max: 17 }).withMessage('VIN must be 17 characters'),
    body('status').optional().isIn(Object.values(VehicleStatus)),
  ],
  update: [
    body('vehicleNumber').optional().trim().notEmpty(),
    body('make').optional().trim().notEmpty(),
    body('model').optional().trim().notEmpty(),
    body('year').optional().isInt({ min: 1900, max: 2100 }),
    body('type').optional().isIn(Object.values(VehicleType)),
    body('fuelType').optional().isIn(Object.values(FuelType)),
    body('registrationNumber').optional().trim().notEmpty(),
    body('vin').optional().trim().isLength({ min: 17, max: 17 }),
    body('status').optional().isIn(Object.values(VehicleStatus)),
  ],
}

// Get all vehicles
export const getAllVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, search, page = 1, limit = 10 } = req.query

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (search) {
      const { Op } = require('sequelize')
      where[Op.or] = [
        { vehicleNumber: { [Op.iLike]: `%${search}%` } },
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { registrationNumber: { [Op.iLike]: `%${search}%` } },
      ]
    }

    const offset = (Number(page) - 1) * Number(limit)

    const { count, rows: vehicles } = await Vehicle.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    })

    res.json({
      vehicles,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    res.status(500).json({ message: 'Error fetching vehicles' })
  }
}

// Get vehicle by ID
export const getVehicleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const vehicle = await Vehicle.findByPk(id)

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    res.json({ vehicle })
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    res.status(500).json({ message: 'Error fetching vehicle' })
  }
}

// Create new vehicle
export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      vehicleNumber,
      make,
      model,
      year,
      type,
      fuelType,
      status,
      vin,
      registrationNumber,
      registrationExpiryDate,
      insuranceNumber,
      insuranceExpiryDate,
      lastServiceDate,
      nextServiceDue,
      currentMileage,
      seatingCapacity,
      color,
      purchasePrice,
      currentValue,
      notes,
      imageUrl,
      assignedDriverId,
    } = req.body

    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findOne({ where: { vehicleNumber } })
    if (existingVehicle) {
      return res.status(400).json({ message: 'Vehicle number already exists' })
    }

    // Check if registration number already exists
    const existingReg = await Vehicle.findOne({ where: { registrationNumber } })
    if (existingReg) {
      return res.status(400).json({ message: 'Registration number already exists' })
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      make,
      model,
      year,
      type,
      fuelType,
      status: status || VehicleStatus.ACTIVE,
      vin,
      registrationNumber,
      registrationExpiryDate: registrationExpiryDate ? new Date(registrationExpiryDate) : undefined,
      insuranceNumber,
      insuranceExpiryDate: insuranceExpiryDate ? new Date(insuranceExpiryDate) : undefined,
      lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined,
      nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : undefined,
      currentMileage: currentMileage || 0,
      seatingCapacity,
      color,
      purchasePrice,
      currentValue,
      notes,
      imageUrl,
      assignedDriverId,
    })

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle,
    })
  } catch (error: any) {
    console.error('Error creating vehicle:', error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Vehicle with this VIN already exists' })
    }
    res.status(500).json({ message: 'Error creating vehicle' })
  }
}

// Update vehicle
export const updateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params

    const vehicle = await Vehicle.findByPk(id)

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    const updateData: any = { ...req.body }

    // Convert date strings to Date objects
    const dateFields = ['registrationExpiryDate', 'insuranceExpiryDate', 'lastServiceDate', 'nextServiceDue']
    dateFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = new Date(updateData[field])
      }
    })

    await vehicle.update(updateData)

    res.json({
      message: 'Vehicle updated successfully',
      vehicle,
    })
  } catch (error: any) {
    console.error('Error updating vehicle:', error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Vehicle number, registration number, or VIN already exists' })
    }
    res.status(500).json({ message: 'Error updating vehicle' })
  }
}

// Delete vehicle
export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const vehicle = await Vehicle.findByPk(id)

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    await vehicle.destroy()

    res.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    res.status(500).json({ message: 'Error deleting vehicle' })
  }
}

// Get vehicle statistics
export const getVehicleStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalVehicles = await Vehicle.count()
    const activeVehicles = await Vehicle.count({ where: { status: VehicleStatus.ACTIVE } })
    const maintenanceVehicles = await Vehicle.count({ where: { status: VehicleStatus.MAINTENANCE } })
    const inactiveVehicles = await Vehicle.count({ where: { status: VehicleStatus.INACTIVE } })

    // Get vehicles by type
    const vehiclesByType = await Vehicle.findAll({
      attributes: [
        'type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    })

    res.json({
      stats: {
        total: totalVehicles,
        active: activeVehicles,
        maintenance: maintenanceVehicles,
        inactive: inactiveVehicles,
        byType: vehiclesByType,
      },
    })
  } catch (error) {
    console.error('Error fetching vehicle stats:', error)
    res.status(500).json({ message: 'Error fetching vehicle statistics' })
  }
}
