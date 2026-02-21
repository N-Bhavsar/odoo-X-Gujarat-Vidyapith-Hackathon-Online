import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { sequelize } from './config/database'
import './models' // Initialize model associations
import authRoutes from './routes/authRoutes'
import vehicleRoutes from './routes/vehicleRoutes'
import driverRoutes from './routes/driverRoutes'
import driverVehicleAssignmentRoutes from './routes/driverVehicleAssignmentRoutes'
import tripRoutes from './routes/tripRoutes'
// import gpsRoutes from './routes/gpsRoutes' // Temporarily disabled - Phase 5

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000

// Create HTTP server with Socket.io
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
})

// Attach io instance to app for use in routes/controllers
app.locals.io = io

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
app.use('/api/trips', tripRoutes)
// app.use('/api/gps', gpsRoutes) // Temporarily disabled - Phase 5

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✓ User connected: ${socket.id}`)

  // Join vehicle tracking room
  socket.on('join-vehicle', (vehicleId: number) => {
    socket.join(`vehicle-${vehicleId}`)
    console.log(`✓ Socket ${socket.id} joined vehicle-${vehicleId}`)
  })

  // Leave vehicle tracking room
  socket.on('leave-vehicle', (vehicleId: number) => {
    socket.leave(`vehicle-${vehicleId}`)
    console.log(`✓ Socket ${socket.id} left vehicle-${vehicleId}`)
  })

  // Join trip tracking room
  socket.on('join-trip', (tripId: number) => {
    socket.join(`trip-${tripId}`)
    console.log(`✓ Socket ${socket.id} joined trip-${tripId}`)
  })

  // Handle real-time location updates
  socket.on('location-update', (data: any) => {
    if (data.vehicleId) {
      io.to(`vehicle-${data.vehicleId}`).emit('location-update', data)
      if (data.tripId) {
        io.to(`trip-${data.tripId}`).emit('location-update', data)
      }
    }
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`✗ User disconnected: ${socket.id}`)
  })
})

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
    
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Socket.io enabled for real-time updates`)
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('✗ Unable to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
export { io }
