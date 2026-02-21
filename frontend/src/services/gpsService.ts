import { io, Socket } from 'socket.io-client'
import { store } from '../store/store'
import { updateLocationRealtime } from '../store/slices/gpsSlice'

class GPSService {
  private socket: Socket | null = null
  private activeVehicles: Set<number> = new Set()
  private activeTrips: Set<number> = new Set()

  /**
   * Initialize Socket.io connection for real-time GPS tracking
   */
  initializeSocket(): void {
    if (this.socket) return

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    
    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
      autoConnect: true
    })

    this.setupEventListeners()
  }

  /**
   * Setup Socket.io event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✓ GPS Socket.io connected:', this.socket?.id)
    })

    this.socket.on('disconnect', () => {
      console.log('✗ GPS Socket.io disconnected')
    })

    this.socket.on('location-update', (data: any) => {
      console.log('📍 Location update received:', data)
      store.dispatch(updateLocationRealtime(data))
    })

    this.socket.on('error', (error) => {
      console.error('✗ GPS Socket.io error:', error)
    })
  }

  /**
   * Join vehicle tracking room for real-time location updates
   */
  joinVehicleTracking(vehicleId: number): void {
    if (!this.socket?.connected) {
      this.initializeSocket()
    }

    if (!this.activeVehicles.has(vehicleId)) {
      this.socket?.emit('join-vehicle', vehicleId)
      this.activeVehicles.add(vehicleId)
      console.log(`✓ Joined vehicle ${vehicleId} tracking`)
    }
  }

  /**
   * Leave vehicle tracking room
   */
  leaveVehicleTracking(vehicleId: number): void {
    if (this.socket?.connected && this.activeVehicles.has(vehicleId)) {
      this.socket.emit('leave-vehicle', vehicleId)
      this.activeVehicles.delete(vehicleId)
      console.log(`✗ Left vehicle ${vehicleId} tracking`)
    }
  }

  /**
   * Join trip tracking room for real-time location updates
   */
  joinTripTracking(tripId: number): void {
    if (!this.socket?.connected) {
      this.initializeSocket()
    }

    if (!this.activeTrips.has(tripId)) {
      this.socket?.emit('join-trip', tripId)
      this.activeTrips.add(tripId)
      console.log(`✓ Joined trip ${tripId} tracking`)
    }
  }

  /**
   * Leave trip tracking room
   */
  leaveTripTracking(tripId: number): void {
    if (this.socket?.connected && this.activeTrips.has(tripId)) {
      this.socket.emit('leave-trip', tripId)
      this.activeTrips.delete(tripId)
      console.log(`✗ Left trip ${tripId} tracking`)
    }
  }

  /**
   * Emit location update event
   */
  emitLocationUpdate(data: any): void {
    if (!this.socket?.connected) {
      this.initializeSocket()
    }
    this.socket?.emit('location-update', data)
  }

  /**
   * Cleanup on disconnect
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.activeVehicles.clear()
      this.activeTrips.clear()
    }
  }

  /**
   * Get socket connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Get active vehicle IDs
   */
  getActiveVehicles(): number[] {
    return Array.from(this.activeVehicles)
  }

  /**
   * Get active trip IDs
   */
  getActiveTrips(): number[] {
    return Array.from(this.activeTrips)
  }
}

// Create singleton instance
export const gpsService = new GPSService()

export default gpsService
