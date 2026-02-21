import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/store'
import { fetchProfile } from '../store/slices/authSlice'
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Search,
  Add,
  DirectionsCar,
  Build,
  Assessment,
  LocalShipping
} from '@mui/icons-material'
import Navbar from '../components/Navbar'
import vehicleService, { Vehicle, VehicleStatus, VehicleType } from '../services/vehicleService'
import { getAllTrips } from '../services/tripService'

interface DashboardKPIs {
  activeFleet: number
  maintenanceAlerts: number
  utilizationRate: number
  pendingCargo: number
}

interface TripWithDetails {
  id: number
  vehicleNumber: string
  driverName: string
  status: string
  origin: string
  destination: string
  scheduledDeparture: string
}

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector((state: any) => state.auth)

  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [trips, setTrips] = useState<TripWithDetails[]>([])
  const [kpis, setKpis] = useState<DashboardKPIs>({
    activeFleet: 0,
    maintenanceAlerts: 0,
    utilizationRate: 0,
    pendingCargo: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<VehicleType | ''>('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile())
    }
  }, [dispatch, user])

  useEffect(() => {
    fetchDashboardData()
  }, [statusFilter, typeFilter, searchQuery])

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch vehicles with filters
      const vehicleFilters: any = {}
      if (statusFilter) vehicleFilters.status = statusFilter
      if (typeFilter) vehicleFilters.type = typeFilter
      if (searchQuery) vehicleFilters.search = searchQuery

      const vehiclesData = await vehicleService.getVehicles(vehicleFilters)
      setVehicles(vehiclesData.vehicles)

      // Fetch all trips for KPI calculations
      const tripsData = await getAllTrips(1, 100)
      const activeTrips = tripsData.trips || []
      
      // Transform trips for display
      const tripsWithDetails: TripWithDetails[] = activeTrips
        .filter((trip: any) => trip.status === 'in_progress' || trip.status === 'scheduled')
        .slice(0, 10)
        .map((trip: any) => ({
          id: trip.id,
          vehicleNumber: trip.Vehicle?.vehicleNumber || 'N/A',
          driverName: trip.Driver ? `${trip.Driver.firstName} ${trip.Driver.lastName}` : 'N/A',
          status: trip.status,
          origin: trip.origin,
          destination: trip.destination,
          scheduledDeparture: trip.scheduledDeparture
        }))
      
      setTrips(tripsWithDetails)

      // Calculate KPIs
      const allVehicles = vehiclesData.vehicles
      const activeFleet = allVehicles.filter((v: Vehicle) => v.status === VehicleStatus.ACTIVE).length
      const maintenanceAlerts = allVehicles.filter((v: Vehicle) => v.status === VehicleStatus.MAINTENANCE).length
      const inProgressTrips = activeTrips.filter((trip: any) => trip.status === 'in_progress').length
      const utilizationRate = activeFleet > 0 ? Math.round((inProgressTrips / activeFleet) * 100) : 0
      const pendingCargo = activeTrips.filter((trip: any) => 
        trip.status === 'scheduled' && trip.cargoDescription
      ).length

      setKpis({
        activeFleet,
        maintenanceAlerts,
        utilizationRate,
        pendingCargo
      })

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setTypeFilter('')
    setSearchQuery('')
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4caf50'
      case 'maintenance':
        return '#ff9800'
      case 'inactive':
        return '#757575'
      case 'in_progress':
        return '#2196f3'
      case 'scheduled':
        return '#9c27b0'
      case 'completed':
        return '#4caf50'
      default:
        return '#757575'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const statsCards = [
    { 
      title: 'Active Fleet', 
      value: kpis.activeFleet.toString(), 
      color: '#4caf50',
      icon: <DirectionsCar sx={{ fontSize: 40 }} />,
      description: 'Vehicles currently operational'
    },
    { 
      title: 'Maintenance Alerts', 
      value: kpis.maintenanceAlerts.toString(), 
      color: '#ff9800',
      icon: <Build sx={{ fontSize: 40 }} />,
      description: 'Vehicles requiring service'
    },
    { 
      title: 'Utilization Rate', 
      value: `${kpis.utilizationRate}%`, 
      color: '#2196f3',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      description: 'Fleet efficiency percentage'
    },
    { 
      title: 'Pending Cargo', 
      value: kpis.pendingCargo.toString(), 
      color: '#9c27b0',
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      description: 'Deliveries awaiting dispatch'
    }
  ]

  return (
    <Box>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Fleet Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time overview of your fleet operations
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  bgcolor: '#1e1e1e', 
                  border: '1px solid #333',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 4px 20px ${card.color}30`
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2" gutterBottom>
                        {card.title}
                      </Typography>
                      <Typography variant="h3" fontWeight="bold" color={card.color}>
                        {loading ? <CircularProgress size={40} /> : card.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {card.description}
                      </Typography>
                    </Box>
                    <Box sx={{ color: card.color, opacity: 0.5 }}>
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters Section */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e1e1e', border: '1px solid #333' }}>
          <Typography variant="h6" gutterBottom>
            Filter Fleet
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by vehicle number, make, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Vehicle Type"
                  onChange={(e) => setTypeFilter(e.target.value as VehicleType)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value={VehicleType.TRUCK}>Truck</MenuItem>
                  <MenuItem value={VehicleType.VAN}>Van</MenuItem>
                  <MenuItem value={VehicleType.SEDAN}>Sedan</MenuItem>
                  <MenuItem value={VehicleType.SUV}>SUV</MenuItem>
                  <MenuItem value={VehicleType.BUS}>Bus</MenuItem>
                  <MenuItem value={VehicleType.MOTORCYCLE}>Motorcycle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as VehicleStatus)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value={VehicleStatus.ACTIVE}>Active</MenuItem>
                  <MenuItem value={VehicleStatus.MAINTENANCE}>Maintenance</MenuItem>
                  <MenuItem value={VehicleStatus.INACTIVE}>Inactive</MenuItem>
                  <MenuItem value={VehicleStatus.RETIRED}>Retired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={handleClearFilters}
                disabled={!statusFilter && !typeFilter && !searchQuery}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            startIcon={<Add />}
            onClick={() => navigate('/trips/new')}
          >
            New Trip
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Add />}
            onClick={() => navigate('/vehicles/new')}
          >
            New Vehicle
          </Button>
        </Box>

        {/* Current Fleet Status Table */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: '#1e1e1e', borderBottom: '1px solid #333' }}>
            <Typography variant="h6">
              Current Fleet Status ({vehicles.length} vehicles)
            </Typography>
          </Box>
          <TableContainer sx={{ bgcolor: '#1e1e1e' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Vehicle Number</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Make & Model</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Mileage</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No vehicles found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => (
                    <TableRow 
                      key={vehicle.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    >
                      <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {vehicle.vehicleNumber}
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        <Chip 
                          label={formatStatus(vehicle.type)} 
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: '#757575', color: '#fff' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={formatStatus(vehicle.status)} 
                          sx={{ 
                            bgcolor: getStatusColor(vehicle.status),
                            color: '#fff',
                            fontWeight: 'bold'
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {vehicle.currentMileage.toLocaleString()} km
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/vehicles/${vehicle.id}`)
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Active Trips Table */}
        <Paper>
          <Box sx={{ p: 2, bgcolor: '#1e1e1e', borderBottom: '1px solid #333' }}>
            <Typography variant="h6">
              Active & Scheduled Trips ({trips.length})
            </Typography>
          </Box>
          <TableContainer sx={{ bgcolor: '#1e1e1e' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Trip ID</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Vehicle</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Driver</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Route</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Departure</TableCell>
                  <TableCell sx={{ color: '#e91e63', fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : trips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No active trips at the moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  trips.map((trip) => (
                    <TableRow key={trip.id} hover>
                      <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>
                        #{trip.id}
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>{trip.vehicleNumber}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{trip.driverName}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {trip.origin} → {trip.destination}
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        {new Date(trip.scheduledDeparture).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={formatStatus(trip.status)} 
                          sx={{ 
                            bgcolor: getStatusColor(trip.status),
                            color: '#fff'
                          }} 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  )
}

export default Dashboard
