import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { sequelize } from './config/database'
import authRoutes from './routes/authRoutes'
import vehicleRoutes from './routes/vehicleRoutes'
import driverRoutes from './routes/driverRoutes'
import driverVehicleAssignmentRoutes from './routes/driverVehicleAssignmentRoutes'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/assignments', driverVehicleAssignmentRoutes)
// app.use('/api/trips', tripRoutes)

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Database connection and server startup
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('✓ Database connection established successfully')
    
    // Sync database models (in development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false })
      console.log('✓ Database models synchronized')
    }
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('✗ Unable to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
