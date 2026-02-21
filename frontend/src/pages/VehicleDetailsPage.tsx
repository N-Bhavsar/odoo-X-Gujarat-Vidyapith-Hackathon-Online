import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  DirectionsCar as CarIcon,
  LocalGasStation as GasIcon,
  Speed as SpeedIcon,
  Event as EventIcon,
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/store'
import { fetchVehicleById, deleteVehicle, clearCurrentVehicle, clearError } from '../store/slices/vehicleSlice'
import { VehicleStatus } from '../services/vehicleService'

const VehicleDetailsPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { id } = useParams<{ id: string }>()
  const { currentVehicle, loading, error } = useAppSelector((state) => state.vehicles)

  useEffect(() => {
    if (id) {
      dispatch(fetchVehicleById(Number(id)))
    }
    return () => {
      dispatch(clearCurrentVehicle())
    }
  }, [dispatch, id])

  const handleEdit = () => {
    navigate(`/vehicles/${id}/edit`)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await dispatch(deleteVehicle(Number(id))).unwrap()
        navigate('/vehicles')
      } catch (err) {
        console.error('Failed to delete vehicle:', err)
      }
    }
  }

  const handleBack = () => {
    navigate('/vehicles')
  }

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.ACTIVE:
        return 'success'
      case VehicleStatus.MAINTENANCE:
        return 'warning'
      case VehicleStatus.INACTIVE:
        return 'default'
      case VehicleStatus.RETIRED:
        return 'error'
      default:
        return 'default'
    }
  }

  const getCapitalizedLabel = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount))
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Vehicles
        </Button>
      </Box>
    )
  }

  if (!currentVehicle) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Vehicle not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Vehicles
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Vehicle Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CarIcon color="primary" />
                <Typography variant="subtitle2" color="textSecondary">
                  Type
                </Typography>
              </Box>
              <Typography variant="h6">{getCapitalizedLabel(currentVehicle.type)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GasIcon color="primary" />
                <Typography variant="subtitle2" color="textSecondary">
                  Fuel Type
                </Typography>
              </Box>
              <Typography variant="h6">{getCapitalizedLabel(currentVehicle.fuelType)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SpeedIcon color="primary" />
                <Typography variant="subtitle2" color="textSecondary">
                  Odometer
                </Typography>
              </Box>
              <Typography variant="h6">{Number(currentVehicle.currentMileage).toLocaleString()} km</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EventIcon color="primary" />
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
              </Box>
              <Chip
                label={getCapitalizedLabel(currentVehicle.status)}
                color={getStatusColor(currentVehicle.status)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Vehicle Number
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {currentVehicle.vehicleNumber}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Registration Number (Plate)
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {currentVehicle.registrationNumber}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Make
            </Typography>
            <Typography variant="body1">{currentVehicle.make}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Model
            </Typography>
            <Typography variant="body1">{currentVehicle.model}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Year
            </Typography>
            <Typography variant="body1">{currentVehicle.year}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              VIN
            </Typography>
            <Typography variant="body1">{currentVehicle.vin || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Color
            </Typography>
            <Typography variant="body1">{currentVehicle.color || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Seating Capacity
            </Typography>
            <Typography variant="body1">{currentVehicle.seatingCapacity || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Max Load Capacity
            </Typography>
            <Typography variant="body1">
              {currentVehicle.maxLoadCapacity 
                ? `${Number(currentVehicle.maxLoadCapacity).toLocaleString()} kg` 
                : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Financial Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Financial Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Purchase Price
            </Typography>
            <Typography variant="body1">{formatCurrency(currentVehicle.purchasePrice)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Current Value
            </Typography>
            <Typography variant="body1">{formatCurrency(currentVehicle.currentValue)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Maintenance & Service */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Maintenance & Service
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Last Service Date
            </Typography>
            <Typography variant="body1">{formatDate(currentVehicle.lastServiceDate)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Next Service Due
            </Typography>
            <Typography variant="body1">{formatDate(currentVehicle.nextServiceDue)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Insurance & Registration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Insurance & Registration
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Insurance Number
            </Typography>
            <Typography variant="body1">{currentVehicle.insuranceNumber || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Insurance Expiry Date
            </Typography>
            <Typography variant="body1">{formatDate(currentVehicle.insuranceExpiryDate)}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              Registration Expiry Date
            </Typography>
            <Typography variant="body1">{formatDate(currentVehicle.registrationExpiryDate)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Additional Notes */}
      {currentVehicle.notes && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {currentVehicle.notes}
          </Typography>
        </Paper>
      )}

      {/* Timestamps */}
      <Box sx={{ mt: 3, display: 'flex', gap: 3 }}>
        <Typography variant="caption" color="textSecondary">
          Created: {formatDate(currentVehicle.createdAt)}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Last Updated: {formatDate(currentVehicle.updatedAt)}
        </Typography>
      </Box>
    </Box>
  )
}

export default VehicleDetailsPage
