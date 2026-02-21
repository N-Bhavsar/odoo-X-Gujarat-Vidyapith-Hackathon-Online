import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/store'
import {
  fetchVehicleById,
  createVehicle,
  updateVehicle,
  clearCurrentVehicle,
  clearError,
} from '../store/slices/vehicleSlice'
import { VehicleStatus, VehicleType, FuelType } from '../services/vehicleService'
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'

interface VehicleFormData {
  vehicleNumber: string
  registrationNumber: string
  make: string
  model: string
  year: number
  vin: string
  type: VehicleType
  fuelType: FuelType
  status: VehicleStatus
  currentMileage: number
  seatingCapacity: number
  color: string
  purchasePrice: number
  currentValue: number
  lastServiceDate: string
  nextServiceDue: string
  insuranceNumber: string
  insuranceExpiryDate: string
  registrationExpiryDate: string
  notes: string
}

const VehicleFormPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { id } = useParams<{ id: string }>()
  const { currentVehicle, loading, error } = useAppSelector((state) => state.vehicles)
  const isEditMode = Boolean(id)

  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleNumber: '',
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    type: VehicleType.SEDAN,
    fuelType: FuelType.PETROL,
    status: VehicleStatus.ACTIVE,
    currentMileage: 0,
    seatingCapacity: 5,
    color: '',
    purchasePrice: 0,
    currentValue: 0,
    lastServiceDate: '',
    nextServiceDue: '',
    insuranceNumber: '',
    insuranceExpiryDate: '',
    registrationExpiryDate: '',
    notes: '',
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchVehicleById(Number(id)))
    }
    return () => {
      dispatch(clearCurrentVehicle())
    }
  }, [dispatch, id, isEditMode])

  useEffect(() => {
    if (currentVehicle && isEditMode) {
      setFormData({
        vehicleNumber: currentVehicle.vehicleNumber || '',
        registrationNumber: currentVehicle.registrationNumber || '',
        make: currentVehicle.make || '',
        model: currentVehicle.model || '',
        year: currentVehicle.year || new Date().getFullYear(),
        vin: currentVehicle.vin || '',
        type: currentVehicle.type || VehicleType.SEDAN,
        fuelType: currentVehicle.fuelType || FuelType.PETROL,
        status: currentVehicle.status || VehicleStatus.ACTIVE,
        currentMileage: Number(currentVehicle.currentMileage) || 0,
        seatingCapacity: currentVehicle.seatingCapacity || 5,
        color: currentVehicle.color || '',
        purchasePrice: Number(currentVehicle.purchasePrice) || 0,
        currentValue: Number(currentVehicle.currentValue) || 0,
        lastServiceDate: currentVehicle.lastServiceDate
          ? new Date(currentVehicle.lastServiceDate).toISOString().split('T')[0]
          : '',
        nextServiceDue: currentVehicle.nextServiceDue
          ? new Date(currentVehicle.nextServiceDue).toISOString().split('T')[0]
          : '',
        insuranceNumber: currentVehicle.insuranceNumber || '',
        insuranceExpiryDate: currentVehicle.insuranceExpiryDate
          ? new Date(currentVehicle.insuranceExpiryDate).toISOString().split('T')[0]
          : '',
        registrationExpiryDate: currentVehicle.registrationExpiryDate
          ? new Date(currentVehicle.registrationExpiryDate).toISOString().split('T')[0]
          : '',
        notes: currentVehicle.notes || '',
      })
    }
  }, [currentVehicle, isEditMode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.vehicleNumber.trim()) {
      errors.vehicleNumber = 'Vehicle number is required'
    }
    if (!formData.registrationNumber.trim()) {
      errors.registrationNumber = 'Registration number is required'
    }
    if (!formData.make.trim()) {
      errors.make = 'Make is required'
    }
    if (!formData.model.trim()) {
      errors.model = 'Model is required'
    }
    if (!formData.year || formData.year < 1900 || formData.year > 2100) {
      errors.year = 'Valid year is required (1900-2100)'
    }
    if (formData.vin && formData.vin.length !== 17) {
      errors.vin = 'VIN must be exactly 17 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Clean up form data - remove empty strings and 0 values for optional fields
    const cleanedData: any = {
      vehicleNumber: formData.vehicleNumber,
      registrationNumber: formData.registrationNumber,
      make: formData.make,
      model: formData.model,
      year: formData.year,
      type: formData.type,
      fuelType: formData.fuelType,
      status: formData.status,
    }

    // Add optional fields only if they have values
    if (formData.vin && formData.vin.trim()) cleanedData.vin = formData.vin.trim()
    if (formData.color && formData.color.trim()) cleanedData.color = formData.color.trim()
    if (formData.currentMileage) cleanedData.currentMileage = Number(formData.currentMileage)
    if (formData.seatingCapacity) cleanedData.seatingCapacity = Number(formData.seatingCapacity)
    if (formData.purchasePrice) cleanedData.purchasePrice = Number(formData.purchasePrice)
    if (formData.currentValue) cleanedData.currentValue = Number(formData.currentValue)
    if (formData.lastServiceDate) cleanedData.lastServiceDate = formData.lastServiceDate
    if (formData.nextServiceDue) cleanedData.nextServiceDue = formData.nextServiceDue
    if (formData.insuranceNumber && formData.insuranceNumber.trim()) cleanedData.insuranceNumber = formData.insuranceNumber.trim()
    if (formData.insuranceExpiryDate) cleanedData.insuranceExpiryDate = formData.insuranceExpiryDate
    if (formData.registrationExpiryDate) cleanedData.registrationExpiryDate = formData.registrationExpiryDate
    if (formData.notes && formData.notes.trim()) cleanedData.notes = formData.notes.trim()

    console.log('Submitting vehicle data:', cleanedData)

    try {
      if (isEditMode && id) {
        await dispatch(updateVehicle({ id: Number(id), data: cleanedData })).unwrap()
      } else {
        const result = await dispatch(createVehicle(cleanedData)).unwrap()
        console.log('Vehicle created successfully:', result)
      }
      navigate('/vehicles')
    } catch (err: any) {
      // Error is handled by Redux slice
      console.error('Failed to save vehicle:', err)
      if (err.response?.data?.errors) {
        console.error('Validation errors:', err.response.data.errors)
      }
    }
  }

  const handleCancel = () => {
    navigate('/vehicles')
  }

  const getCapitalizedLabel = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Vehicle Number"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                error={Boolean(formErrors.vehicleNumber)}
                helperText={formErrors.vehicleNumber}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Registration Number (Plate)"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                error={Boolean(formErrors.registrationNumber)}
                helperText={formErrors.registrationNumber}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                label="Make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                error={Boolean(formErrors.make)}
                helperText={formErrors.make}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                error={Boolean(formErrors.model)}
                helperText={formErrors.model}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                error={Boolean(formErrors.year)}
                helperText={formErrors.year}
                InputProps={{ inputProps: { min: 1900, max: 2100 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="VIN (Vehicle Identification Number)"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                error={Boolean(formErrors.vin)}
                helperText={formErrors.vin || 'Must be 17 characters'}
                inputProps={{ maxLength: 17 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </Grid>

            {/* Vehicle Specifications */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Vehicle Specifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                required
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                {Object.values(VehicleType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {getCapitalizedLabel(type)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                required
                label="Fuel Type"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
              >
                {Object.values(FuelType).map((fuel) => (
                  <MenuItem key={fuel} value={fuel}>
                    {getCapitalizedLabel(fuel)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                required
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {Object.values(VehicleStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {getCapitalizedLabel(status)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Seating Capacity"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Current Mileage (Odometer) - km"
                name="currentMileage"
                value={formData.currentMileage}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Financial Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Purchase Price"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Current Value"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>

            {/* Maintenance & Service */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Maintenance & Service
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Last Service Date"
                name="lastServiceDate"
                value={formData.lastServiceDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Next Service Due"
                name="nextServiceDue"
                value={formData.nextServiceDue}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Insurance & Registration */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Insurance & Registration
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Insurance Number"
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Insurance Expiry Date"
                name="insuranceExpiryDate"
                value={formData.insuranceExpiryDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Registration Expiry Date"
                name="registrationExpiryDate"
                value={formData.registrationExpiryDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Additional Notes */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes or information about the vehicle..."
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEditMode ? 'Update Vehicle' : 'Create Vehicle'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default VehicleFormPage
