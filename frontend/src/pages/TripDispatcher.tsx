import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Box,
  Typography,
  Grid,
  Alert,
  Card,
  CardContent,
  IconButton
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllTrips,
  createTrip,
  startTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
  getTripStatistics
} from '../services/tripService'
import { getAllDrivers } from '../services/driverService'
import vehicleService, { VehicleStatus } from '../services/vehicleService'
import {
  fetchTripsStart,
  fetchTripsSuccess,
  fetchTripsError,
  createTripStart,
  createTripSuccess,
  createTripError,
  fetchTripStatisticsStart,
  fetchTripStatisticsSuccess,
  fetchTripStatisticsError,
  clearError
} from '../store/slices/tripSlice'
import { RootState } from '../store/store'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

const TripDispatcher = () => {
  const dispatch = useDispatch()
  const { trips, loading, error, tripStatistics } = useSelector((state: RootState) => state.trips)

  const [openDialog, setOpenDialog] = useState(false)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drivers, setDrivers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    origin: '',
    destination: '',
    scheduledDeparture: '',
    scheduledArrival: '',
    distanceKm: '',
    cargoDescription: '',
    cargoWeightKg: '',
    notes: ''
  })

  useEffect(() => {
    fetchTripsData()
    fetchStatistics()
    fetchDriversAndVehicles()
  }, [statusFilter])

  const fetchTripsData = async () => {
    try {
      dispatch(fetchTripsStart())
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {}
      const data = await getAllTrips(1, 50, filters)
      dispatch(fetchTripsSuccess({ trips: data.trips, total: data.pagination.total }))
    } catch (err: any) {
      dispatch(fetchTripsError(err.message || 'Failed to fetch trips'))
    }
  }

  const fetchStatistics = async () => {
    try {
      dispatch(fetchTripStatisticsStart())
      const data = await getTripStatistics()
      dispatch(fetchTripStatisticsSuccess(data))
    } catch (err: any) {
      dispatch(fetchTripStatisticsError(err.message || 'Failed to fetch statistics'))
    }
  }

  const fetchDriversAndVehicles = async () => {
    try {
      const driversData = await getAllDrivers(1, 100, { status: 'active' })
      const vehiclesData = await vehicleService.getVehicles({ status: VehicleStatus.ACTIVE })
      setDrivers(driversData.drivers || [])
      setVehicles(vehiclesData.vehicles || [])
    } catch (err) {
      console.error('Failed to fetch drivers/vehicles:', err)
    }
  }

  const handleOpenDialog = () => {
    setFormData({
      vehicleId: '',
      driverId: '',
      origin: '',
      destination: '',
      scheduledDeparture: '',
      scheduledArrival: '',
      distanceKm: '',
      cargoDescription: '',
      cargoWeightKg: '',
      notes: ''
    })
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleOpenCancelDialog = (tripId: number) => {
    setSelectedTripId(tripId)
    setCancelReason('')
    setOpenCancelDialog(true)
  }

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false)
    setSelectedTripId(null)
    setCancelReason('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateTrip = async () => {
    try {
      dispatch(createTripStart())
      const payload = {
        vehicleId: Number(formData.vehicleId),
        driverId: Number(formData.driverId),
        origin: formData.origin,
        destination: formData.destination,
        scheduledDeparture: formData.scheduledDeparture,
        scheduledArrival: formData.scheduledArrival || undefined,
        distanceKm: formData.distanceKm ? Number(formData.distanceKm) : undefined,
        cargoDescription: formData.cargoDescription || undefined,
        cargoWeightKg: formData.cargoWeightKg ? Number(formData.cargoWeightKg) : undefined,
        notes: formData.notes || undefined
      }
      const response = await createTrip(payload)
      dispatch(createTripSuccess(response.trip))
      handleCloseDialog()
      fetchTripsData()
      fetchStatistics()
    } catch (err: any) {
      dispatch(createTripError(err.response?.data?.message || 'Failed to create trip'))
    }
  }

  const handleStartTrip = async (tripId: number) => {
    try {
      await startTrip(tripId)
      fetchTripsData()
      fetchStatistics()
    } catch (err: any) {
      console.error('Failed to start trip:', err)
      alert(err.response?.data?.message || 'Failed to start trip')
    }
  }

  const handleCompleteTrip = async (tripId: number) => {
    try {
      await completeTrip(tripId)
      fetchTripsData()
      fetchStatistics()
    } catch (err: any) {
      console.error('Failed to complete trip:', err)
      alert(err.response?.data?.message || 'Failed to complete trip')
    }
  }

  const handleCancelTrip = async () => {
    if (!selectedTripId) return
    try {
      await cancelTrip(selectedTripId, cancelReason)
      handleCloseCancelDialog()
      fetchTripsData()
      fetchStatistics()
    } catch (err: any) {
      console.error('Failed to cancel trip:', err)
      alert(err.response?.data?.message || 'Failed to cancel trip')
    }
  }

  const handleDeleteTrip = async (tripId: number) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await deleteTrip(tripId)
        fetchTripsData()
        fetchStatistics()
      } catch (err: any) {
        console.error('Failed to delete trip:', err)
        alert(err.response?.data?.message || 'Failed to delete trip')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info'
      case 'in_progress':
        return 'warning'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Trip Dispatcher
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage and dispatch trips to drivers and vehicles
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {tripStatistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Trips
                </Typography>
                <Typography variant="h4">{tripStatistics.totalTrips}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  In Progress
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {tripStatistics.inProgressTrips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Completed
                </Typography>
                <Typography variant="h4" color="success.main">
                  {tripStatistics.completedTrips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Completion Rate
                </Typography>
                <Typography variant="h4">{tripStatistics.completionRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Create New Trip
        </Button>
      </Box>

      {/* Trips Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Scheduled Departure</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No trips found
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{trip.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <strong>{trip.origin}</strong> → <strong>{trip.destination}</strong>
                      </Typography>
                      {trip.distanceKm && (
                        <Typography variant="caption" color="textSecondary">
                          {trip.distanceKm} km
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {trip.driver ? (
                        <Box>
                          <Typography variant="body2">
                            {trip.driver.firstName} {trip.driver.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {trip.driver.licenseNumber}
                          </Typography>
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {trip.vehicle ? (
                        <Box>
                          <Typography variant="body2">{trip.vehicle.vehicleNumber}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {trip.vehicle.make} {trip.vehicle.model}
                          </Typography>
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{formatDate(trip.scheduledDeparture)}</TableCell>
                    <TableCell>
                      <Chip label={formatStatus(trip.status)} color={getStatusColor(trip.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {trip.status === 'scheduled' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStartTrip(trip.id)}
                              title="Start Trip"
                            >
                              <PlayArrowIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenCancelDialog(trip.id)}
                              title="Cancel Trip"
                            >
                              <CancelIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTrip(trip.id)}
                              title="Delete Trip"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                        {trip.status === 'in_progress' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCompleteTrip(trip.id)}
                              title="Complete Trip"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenCancelDialog(trip.id)}
                              title="Cancel Trip"
                            >
                              <CancelIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Create Trip Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Trip</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Driver *</InputLabel>
                <Select
                  value={formData.driverId}
                  label="Driver *"
                  onChange={(e) => handleSelectChange('driverId', e.target.value)}
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.firstName} {driver.lastName} - {driver.licenseNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle *</InputLabel>
                <Select
                  value={formData.vehicleId}
                  label="Vehicle *"
                  onChange={(e) => handleSelectChange('vehicleId', e.target.value)}
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicleNumber} - {vehicle.make} {vehicle.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Origin *"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Destination *"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled Departure *"
                name="scheduledDeparture"
                type="datetime-local"
                value={formData.scheduledDeparture}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled Arrival"
                name="scheduledArrival"
                type="datetime-local"
                value={formData.scheduledArrival}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Distance (km)"
                name="distanceKm"
                type="number"
                value={formData.distanceKm}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cargo Weight (kg)"
                name="cargoWeightKg"
                type="number"
                value={formData.cargoWeightKg}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cargo Description"
                name="cargoDescription"
                value={formData.cargoDescription}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleCreateTrip}
            variant="contained"
            disabled={!formData.vehicleId || !formData.driverId || !formData.origin || !formData.destination || !formData.scheduledDeparture}
          >
            Create Trip
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Trip Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancel Trip</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Cancellation Reason"
            name="cancelReason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Close</Button>
          <Button onClick={handleCancelTrip} variant="contained" color="error">
            Cancel Trip
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default TripDispatcher
