import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import User, { UserRole } from '../models/User'
import { hashPassword, comparePassword } from '../utils/password'
import { generateToken } from '../utils/jwt'

export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role')
]

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { email, password, firstName, lastName, role, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' })
      return
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || UserRole.DRIVER,
      phone,
      isActive: true
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ where: { email } })
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({ message: 'Account is inactive' })
      return
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    // Update last login
    await user.update({ lastLogin: new Date() })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk((req as any).user.userId, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
}
